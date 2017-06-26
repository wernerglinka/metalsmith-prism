'use strict';

const cheerio = require('cheerio');
const _debug = require('debug');
const extname = require('path').extname;
const languages = require('prismjs').languages;
const _ = require('lodash');
const Prism = require('prismjs');
const he = require('he');

const debug = _debug('metalsmith-prism');

const isHTMLFile = (filePath) => {
  return /\.html|\.htm/.test(extname(filePath));
};

module.exports = (options) => {

  options = options || {};

  if (options.preLoad) {
    _.each(options.preLoad, (language) => {
      try {
        require(`prismjs/components/prism-${language}.js`);
      } catch (e) {
        /* eslint no-console: 0 */
        console.warn(`Failed to load prism syntax: ${language}`);
        console.warn(e);
      }
    });
  }

  return function(files, metalsmith, done) {

    setImmediate(done);

    function requireLanguage(language) {

      if (!languages[language]) {

        try {
          require(`prismjs/components/prism-${language}.js`);
        } catch (e) {
          /* eslint no-console: 0 */
          console.warn(`Failed to load prism syntax: ${language}`);
          console.warn(e);
        }
      }
    }

    _.each(files, (file, name) => {

      // gulpsmith || vanilla Metalsmith support
      if (!isHTMLFile(file.path || name) && !isHTMLFile(name)) {
        return;
      }

      const contents = file.contents.toString();
      const $ = cheerio.load(contents);
      let highlighted = false;

      $('code').each(function() {

        const $this = $(this);
        const className = $this.attr('class') || '';
        const targets = className.split('language-');

        if (targets.length > 1) {

          const $pre = $this.parent('pre');

          if ($pre) {
            // Copy className to <pre> container
            $pre.addClass(className);

            if (options.lineNumbers) {
              debug('adding line numbers');
              $pre.addClass('line-numbers');
            }
          }

          highlighted = true;

          let language = targets[1];

          requireLanguage(language);

          if (!languages[language]) {
            language = 'markup';
          }

          const html = (language === 'markup' && !options.decode) ? $this.html() : he.decode($this.html());

          const highlightedCode = Prism.highlight(html, Prism.languages[language]);
          $this.html(highlightedCode);

        }

      });

      if (highlighted) {
        file.contents = new Buffer($.html());
      }

    });
  };

};
