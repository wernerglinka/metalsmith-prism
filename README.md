# metalsmith-prism

> Syntax highlighting for [Metalsmith](http://www.metalsmith.io/) HTML templates using [Prism.js](http://prismjs.com/)

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square&label=license)](http://opensource.org/licenses/MIT)
[![NPM](http://img.shields.io/npm/v/metalsmith-prism.svg?style=flat-square&label=npm)](https://npmjs.org/package/metalsmith-prism)
[![Dependency Status](https://img.shields.io/david/Availity/metalsmith-prism.svg?style=flat-square)](https://david-dm.org/Availity/metalsmith-prism)
[![Linux Passing](https://img.shields.io/travis/Availity/metalsmith-prism.svg?style=flat-square&label=linux)](https://travis-ci.org/Availity/metalsmith-prism)
[![Windows Passing](https://img.shields.io/appveyor/ci/robmcguinness/metalsmith-prism.svg?style=flat-square&label=windows)](https://ci.appveyor.com/project/robmcguinness/metalsmith-prism)

## Quickstart

+ Install **metalsmith-prism** with npm

>
``` bash
  npm install metalsmith-prism --save-dev
```

+ Add language definition to code block

>
``` html
<code class="language-css">p { color: red }</code>
```

+ Add `metalsmith-prism` plugin to metalsmith

>
``` js
var metalsmith = require('metalsmith');
var metalsmithPrism = require('metalsmith-prism');
metalsmith(__dirname)
  .use(metalsmithPrism())
  .build();
```

+ _OPTIONAL_ To use with Markdown code blocks rendered by [metalsmith-markdown](https://github.com/segmentio/metalsmith-markdown)

>
``` js
var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var metalsmithPrism = require('metalsmith-prism');
metalsmith(__dirname)
  // Custom langPrefix option needed as markdown uses 'lang-' by default:
  .use(markdown( { langPrefix: 'language-' } ))
  .use(metalsmithPrism())
  .build();
```

## Language support

Supports all programming languages that have a corresponding Prism.js component file. Component files are found in the [Prism.js `components` directory](https://github.com/PrismJS/prism/tree/master/components). 

### JSON 

JSON syntax highlighting is enhanced using the following syntax definition

>
``` js
Prism.languages.json = {
  'keys': /".+"(?=:)/g,
  'boolean': /\b(true|false)/g,
  'punctuation': /({|}|:|\[|\]|,)/g,
  'keyword': /\b(null)\b/g
}
```
>
```html
<code class="language-json">
{
    ping: "pong"
}
</code>
```

### Options

#### decode (optional)

- Always decode the html entities when processing language of type `markup`

```javascript
Metalsmith(__dirname)
  .use(metalsmithPrism({
    decode: true
  }))
```

#### json (optional)

- Supply custom JSON syntax definition

```javascript
Metalsmith(__dirname)
  .use(metalsmithPrism({
    json: {
      'keys': /".+"(?=:)/g,
      'boolean': /\b(true|false)/g,
      'punctuation': /({|}|:|\[|\]|,)/g,
      'keyword': /\b(null)\b/g
    }
  }))
```

#### lineNumbers (optional)

- Supply line-numbers class on pre tag

```javascript
Metalsmith(__dirname)
  .use(metalsmithPrism({
    lineNumbers: true
  }))
```



## Authors

**Robert McGuinness**
+ [rob.mcguinness@availity.com](rob.mcguinness@availity.com)

## Disclaimer

Open source software components distributed or made available in the Availity Materials are licensed to Company under the terms of the applicable open source license agreements, which may be found in text files included in the Availity Materials.

## Copyright and license

Code and documentation copyright 2015 Availity, LLC. Code released under [the MIT license](https://github.com/Availity/metalsmith-prism/blob/master/LICENSE).



