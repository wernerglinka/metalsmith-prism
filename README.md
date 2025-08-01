# metalsmith-prism

A Metalsmith plugin that **adds Prism specific HTML markup** to code sections for syntax coloring. Now with full dual module support for both **ESM** and **CommonJS** environments.

[![metalsmith:plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![license: MIT][license-badge]][license-url]
[![coverage][coverage-badge]][coverage-url]
[![ESM/CommonJS][modules-badge]][npm-url]
[![Known Vulnerabilities](https://snyk.io/test/npm/metalsmith-prism/badge.svg)](https://snyk.io/test/npm/metalsmith-prism)

## Dual Module Support (ESM and CommonJS)

This plugin supports both ESM and CommonJS environments with no configuration needed:

- ESM: `import prism from 'metalsmith-prism'`
- CommonJS: `const prism = require('metalsmith-prism')`

The package detects your environment automatically and provides the appropriate module format. This makes it compatible with both modern ESM projects and legacy CommonJS codebases.

While this plugin adds all the required Prism HTML markup, **prism.css** must be included on the page to provide the syntax coloring. The plugin:

- Supports both ESM and CommonJS environments
- Automatically handles language dependencies
- Supports HTML entity decoding
- Can add line numbers
- Works seamlessly with Markdown code blocks
- Supports all Prism.js language

## Requirements

- Node `>= 18.0.0`
- Metalsmith `>= v2.6.0`

## Quick Start

1. Install the plugin
2. Add Prism CSS to your page
3. Add language classes to your code blocks
4. Configure the plugin in your Metalsmith build

Example using all features:

```javascript
metalsmith(__dirname).use(
  prism({
    decode: true, // Decode HTML entities
    lineNumbers: true, // Show line numbers
    preLoad: ['java'] // Pre-load language dependencies
  })
);
```

## Installation

NPM:

```bash
  npm install metalsmith-prism --save-dev
```

Yarn:

```bash
  yarn add metalsmith-prism
```

## Usage

### Add Prism styles to page header.

If the `linenumbers` option is set to `true`, `prism-line-numbers.css` must be added to the page.

The css files can be downloaded from the [Prism website](https://prismjs.com/download.html#themes=prism&languages=markup+css+clike+javascript) or [use a CDN](https://prismjs.com/#basic-usage-cdn). Please refer to the [Prism documentation](https://prismjs.com/index.html) for details.

```html
<link href="/assets/prism.css" rel="stylesheet" /> <link href="/assets/prism-line-numbers.css" rel="stylesheet" />
```

### Add language definition to code block

```html
<code class="language-css">p { color: red }</code>
```

### Add `metalsmith-prism` plugin to metalsmith

**ESM:**

```js
import Metalsmith from 'metalsmith';
import prism from 'metalsmith-prism';

Metalsmith(__dirname).use(prism()).build();
```

**CommonJS:**

```js
const Metalsmith = require('metalsmith');
const prism = require('metalsmith-prism');

Metalsmith(__dirname).use(prism()).build();
```

### To use with Markdown code blocks rendered by [@metalsmith/markdown](https://github.com/metalsmith/markdown)

**ESM:**

```js
import Metalsmith from 'metalsmith';
import markdown from '@metalsmith/markdown';
import prism from 'metalsmith-prism';

Metalsmith(__dirname).use(markdown()).use(prism()).build();
```

**CommonJS:**

```js
const Metalsmith = require('metalsmith');
const markdown = require('@metalsmith/markdown');
const prism = require('metalsmith-prism');

Metalsmith(__dirname).use(markdown()).use(prism()).build();
```

## Language support

The plugin default language support includes: markup, css, clike, javascript and php.

Supports all programming languages that have a corresponding Prism.js component file. Component files are found in the [Prism.js `components` directory](https://github.com/PrismJS/prism/tree/master/components).

## Options

**decode (optional)**

Always decode the html entities when processing language of type `markup`

```js
Metalsmith(__dirname).use(
  prism({
    decode: true
  })
);
```

**lineNumbers (optional)**

Adds the additional HTML markup so line numbers can be added via the line-numbers CSS.

```javascript
Metalsmith(__dirname).use(
  prism({
    lineNumbers: true
  })
);
```

**preLoad (optional)**

Pre-loads language component(s), such that each language component registers itself in the order given in the input array

Useful for loading syntax that extends other language components that are not automatically registered by Prism

```javascript
Metalsmith(__dirname).use(
  prism({
    preLoad: ['java', 'scala']
  })
);
```

## Examples

### Basic Usage

Transform a simple code block with JavaScript:

**Input HTML:**

```html
<pre><code class="language-javascript">
const greeting = 'Hello, World!';
console.log(greeting);
</code></pre>
```

**Output HTML (with syntax highlighting):**

```html
<pre class="language-javascript"><code class="language-javascript">
<span class="token keyword">const</span> greeting <span class="token operator">=</span> <span class="token string">'Hello, World!'</span><span class="token punctuation">;</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>greeting<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
```

### With Line Numbers

Enable line numbers for longer code examples:

```javascript
metalsmith(__dirname)
  .use(
    prism({
      lineNumbers: true
    })
  )
  .build();
```

This adds the `line-numbers` class and line number markup to your code blocks.

### Working with Markdown

When using with @metalsmith/markdown, code blocks in markdown files are automatically processed:

**Markdown file:**

````markdown
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```
````

**Build configuration:**

```javascript
metalsmith(__dirname)
  .use(markdown())
  .use(
    prism({
      preLoad: ['python'] // Ensure Python support is loaded
    })
  )
  .build();
```

### Preloading Languages

For better performance with known languages, preload them:

```javascript
metalsmith(__dirname)
  .use(
    prism({
      preLoad: ['python', 'ruby', 'go', 'rust']
    })
  )
  .build();
```

### Handling Special Characters

For code with HTML entities, use the decode option:

```javascript
metalsmith(__dirname)
  .use(
    prism({
      decode: true // Properly handle &lt;, &gt;, &amp; etc.
    })
  )
  .build();
```

## Debug

To enable debug logs, set the DEBUG environment variable to metalsmith-prism\*:

```bash
metalsmith.env('DEBUG', 'metalsmith-prism*');
```

## CLI Usage

Add `metalsmith-prism` key to your `metalsmith.json` plugins key

```json
{
  "plugins": {
    "metalsmith-prism": {
      "lineNumbers": true,
      "decode": true
    }
  }
}
```

## Test Coverage

This project maintains high statement and line coverage for the source code. Coverage is verified during the release process using the c8 coverage tool.

## Credits

- [Robert McGuinness](https://github.com/robmcguinness) - for the initial implementation of the plugin.
- [Werner Glinka](https://github.com/wernerglinka) - current maintainer.

## License

Code released under [the MIT license](https://github.com/wernerglinka/metalsmith-prism/blob/main/LICENSE).

[metalsmith-badge]: https://img.shields.io/badge/metalsmith-plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[npm-badge]: https://img.shields.io/npm/v/metalsmith-prism.svg
[npm-url]: https://www.npmjs.com/package/metalsmith-prism
[license-badge]: https://img.shields.io/github/license/wernerglinka/metalsmith-prism
[license-url]: LICENSE
[coverage-badge]: https://img.shields.io/badge/test%20coverage-94%25-brightgreen
[coverage-url]: #test-coverage
[modules-badge]: https://img.shields.io/badge/modules-ESM%2FCJS-blue
