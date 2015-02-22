// json syntax highlighting
module.exports = {
  'keys': /".+"(?=:)/g,
  'boolean': /\b(true|false)/g,
  'punctuation': /({|}|:|\[|\]|,)/g,
  'keyword': /\b(null)\b/g
};
