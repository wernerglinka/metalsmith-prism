'use strict';

const cheerio = require('cheerio');
const _debug = require('debug');
const extname = require('path').extname;
const _ = require('lodash');
const Prism = require('prismjs');
const he = require('he');
const vm = require('vm');
const fs = require('fs');

const debug = _debug('metalsmith-prism');

const jsonSyntax = require('./prism-json');

const isHTMLFile = (filePath) => {
  return /\.html|\.htm/.test(extname(filePath));
};

module.exports = (options) => {

  options = options || {};

  Prism.languages.json = options.json ? options.json : jsonSyntax;

  return function(files, metalsmith, done) {

    setImmediate(done);

    function requireLanguage(language) {

      if (!Prism.languages[language]) {

        const path = require.resolve('prismjs/components/prism-' + language);
        const code = fs.readFileSync(path, 'utf8').toString();

        // make Prism and self object available in the plugins local scope
        vm.runInNewContext(code, {
          self: {},
          Prism
        });
      }
    }

    _.each(files, (file, name) => {

      // gulpsmith || vanilla Metalsmith support
      if (!isHTMLFile(file.path || name)) {
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

          const language = targets[1];

          requireLanguage(language);

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
