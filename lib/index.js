var cheerio = require('cheerio');
var extname = require('path').extname;
var _ = require('lodash');
Prism = require('prismjs');
var he = require('he');
var jsdom = require('jsdom').jsdom;

var jsonSyntax = require('./prism-json');
// require('prismjs/components/prism-ruby');
// require('prismjs');
// require('prismjs/components/prism-markup');
// require('prismjs/components/prism-css');
// require('prismjs/components/prism-css-extras');
// require('prismjs/components/prism-clike');
// require('prismjs/components/prism-javascript');
// require('prismjs/components/prism-java');
// require('prismjs/components/prism-php');
// require('prismjs/components/prism-php-extras');
// require('prismjs/components/prism-coffeescript');
// require('prismjs/components/prism-scss');
// require('prismjs/components/prism-bash');
// require('prismjs/components/prism-python');
// require('prismjs/components/prism-http');
require('prismjs/components/prism-ruby');

var isHTMLFile = function(filePath) {
  return /\.html|\.htm/.test(extname(filePath));
};

module.exports = function(options) {

  options = options || {};

  Prism.languages.json = options.json ? options.json : jsonSyntax;

  return function(files, metalsmith, done) {
    setImmediate(done);

    _.each(files, function(file, name) {

      // gulpsmith || vanilla Metalsmith support
      if(!isHTMLFile(file.path || name)) {
        return;
      }

      var contents = file.contents.toString();
      var doc = jsdom(contents);

      // var $ = cheerio.load(contents);
      var highlighted = false;

      var elements = doc.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

      console.log("hello world");
      for (var i=0, element; element = elements[i++];) {
        highlighted = true;

        console.log("before highlight", element.innerHTML);
        // element.innerHTML = "foo";
        Prism.highlightElement(element, false);
        console.log("after highlight", element.innerHTML);
      }

      // $('code').each(function() {

      //   var $this = $(this);
      //   var className = $this.attr('class');

      //   var targets = className ? className.split('language-') : ['', 'markup'];

      //   if(targets.length > 1) {
      //     highlighted = true;

      //     var language = targets[1];

      //     var html = (language === 'markup') ? $this.html() : he.decode($this.html());
      //     var highlightedCode = Prism.highlight(html, Prism.languages[language]);
      //     $this.html(highlightedCode);
      //   }
      // });

      if(highlighted) {
        console.log("changing file.contents");
        file.contents = new Buffer(doc.documentElement.outerHTML);
      }

    });
  };

};
