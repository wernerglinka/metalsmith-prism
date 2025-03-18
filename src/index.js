import { load } from 'cheerio';
import { extname } from 'path';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import he from 'he';

// Import languages from Prism's default export
const { languages } = Prism;

// Preload PHP
loadLanguages(['php']);

/**
 * Check if a file is HTML
 * @param {string} filePath
 * @returns {boolean}
 */
const isHTMLFile = (filePath) => {
  return /\.html|\.htm/.test(extname(filePath));
};

/**
 * @typedef Options
 * @property {boolean} [decode=false] - Whether to decode HTML entities
 * @property {boolean} [lineNumbers=false] - Whether to add line numbers
 * @property {string[]} [preLoad=[]] - Languages to preload
 */

/**
 * Metalsmith plugin to highlight code syntax with PrismJS
 *
 * @param {Options} [options]
 * @returns {import('metalsmith').Plugin}
 */
function metalsmithPrism(options = {}) {
  if (options.preLoad) {
    options.preLoad.forEach((language) => {
      try {
        loadLanguages([language]);
      } catch (e) {
        console.warn(`Failed to preload prism syntax: ${language}!`);
      }
    });
  }

  /**
   * Require optional language package
   * @param {string} language
   */
  function requireLanguage(language) {
    if (!languages[language]) {
      try {
        loadLanguages([language]);
      } catch (e) {
        console.warn(`Failed to load prism syntax: ${language}!`);
      }
    }
  }

  // Set up line numbers
  const NEW_LINE_EXP = /\n(?!$)/g;
  let lineNumbersWrapper;

  Prism.hooks.add('after-tokenize', function (env) {
    const match = env.code.match(NEW_LINE_EXP);
    const linesNum = match ? match.length + 1 : 1;
    const lines = new Array(linesNum + 1).join('<span></span>');
    lineNumbersWrapper = `<span aria-hidden="true" class="line-numbers-rows">${lines}</span>`;
  });

  return function (files, metalsmith, done) {
    setImmediate(done);

    Object.keys(files).forEach((file) => {
      if (!isHTMLFile(file)) {
        return;
      }

      const contents = files[file].contents.toString();
      const $ = load(contents, { decodeEntities: false });
      let highlighted = false;
      const code = $('code');

      if (!code.length) return;

      code.each(function () {
        const $this = $(this);

        const className = $this.attr('class') || '';
        const targets = className.split('language-');
        let addLineNumbers = false;

        if (targets.length > 1) {
          const $pre = $this.parent('pre');

          if ($pre) {
            // Copy className to <pre> container
            $pre.addClass(className);

            if (options.lineNumbers) {
              $pre.addClass('line-numbers');
              addLineNumbers = true;
            }
          }

          highlighted = true;
          let language = targets[1];
          requireLanguage(language);

          if (!languages[language]) {
            language = 'markup';
          }

          const html = language === 'markup' && !options.decode ? $this.html() : he.decode($this.html());

          const highlightedCode = Prism.highlight(html, languages[language]);
          $this.html(addLineNumbers ? highlightedCode + lineNumbersWrapper : highlightedCode);
        }
      });

      if (highlighted) {
        files[file].contents = Buffer.from($.html());
      }
    });
  };
}

export default metalsmithPrism;