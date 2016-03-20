// json syntax highlighting
'use strict';

module.exports = {
  'keys': /".+"(?=:)/g,
  'boolean': /\b(true|false)/g,
  'punctuation': /({|}|:|\[|\]|,)/g,
  'keyword': /\b(null)\b/g
};
