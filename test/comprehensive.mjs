/* global describe, it */

import * as chai from 'chai';
import { load } from 'cheerio';
const { expect } = chai;

import metalsmithPrism from '../src/index.js';

describe('metalsmith-prism comprehensive tests', function() {
  // Set timeout for all tests
  this.timeout(15000);

  describe('Real-world Usage Scenarios', () => {
    it('should process multiple code blocks with different languages in one file', (done) => {
      const files = {
        'multiple.html': {
          contents: Buffer.from(`
            <pre><code class="language-javascript">const x = 1;</code></pre>
            <p>Some text in between</p>
            <pre><code class="language-css">body { color: red; }</code></pre>
            <pre><code class="language-markup"><div>HTML</div></code></pre>
          `)
        }
      };
      
      const plugin = metalsmithPrism();
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['multiple.html'].contents.toString();
        expect(result).to.include('token keyword');  // JS highlighting
        expect(result).to.include('token property');  // CSS highlighting
        expect(result).to.include('token tag');  // HTML highlighting
        done();
      });
    });

    it('should correctly apply multiple options together', (done) => {
      const files = {
        'combined-options.html': {
          contents: Buffer.from(`
            <pre><code class="language-markup">&lt;div class="test"&gt;Content&lt;/div&gt;</code></pre>
          `)
        }
      };
      
      const plugin = metalsmithPrism({
        decode: true,
        lineNumbers: true,
        preLoad: ['markup']
      });
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['combined-options.html'].contents.toString();
        expect(result).to.include('line-numbers');  // Line numbers added
        expect(result).to.include('token tag');  // Highlighting applied
        expect(result).to.include('line-numbers-rows');  // Line number markup added
        done();
      });
    });

    it('should handle large code blocks efficiently', function(done) {
      this.timeout(15000); // Increase timeout for this test
      
      // Generate a large code block (1000+ lines should be enough for testing)
      let largeCode = '';
      for (let i = 0; i < 1000; i++) {
        largeCode += `const var${i} = ${i};\n`;
      }
      
      const files = {
        'large.html': {
          contents: Buffer.from(`<pre><code class="language-javascript">${largeCode}</code></pre>`)
        }
      };
      
      const plugin = metalsmithPrism();
      
      const start = process.hrtime.bigint();
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const end = process.hrtime.bigint();
        const timeMs = Number(end - start) / 1_000_000;
        
        // Should complete in reasonable time (adjust threshold as needed)
        expect(timeMs).to.be.lessThan(5000);
        // Check for token class in the output
        const result = files['large.html'].contents.toString();
        expect(result).to.include('class="token');
        done();
      });
    });
  });

  describe('Line Numbering Features', () => {
    it('should generate correct number of line placeholders', (done) => {
      const multilineCode = "line1\nline2\nline3\nline4\nline5";
      
      const files = {
        'line-count.html': {
          contents: Buffer.from(`<pre><code class="language-javascript">${multilineCode}</code></pre>`)
        }
      };
      
      const plugin = metalsmithPrism({ lineNumbers: true });
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['line-count.html'].contents.toString();
        const $ = load(result);
        const lineRows = $('.line-numbers-rows span');
        
        // Should have 5 line number placeholders
        expect(lineRows.length).to.equal(5);
        done();
      });
    });

    it('should handle code with no line breaks correctly', (done) => {
      const singleLineCode = "const x = 1;";
      
      const files = {
        'single-line.html': {
          contents: Buffer.from(`<pre><code class="language-javascript">${singleLineCode}</code></pre>`)
        }
      };
      
      const plugin = metalsmithPrism({ lineNumbers: true });
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['single-line.html'].contents.toString();
        const $ = load(result);
        const lineRows = $('.line-numbers-rows span');
        
        // Should have 1 line number placeholder
        expect(lineRows.length).to.equal(1);
        done();
      });
    });
  });

  describe('Context Sensitivity', () => {
    it('should only process code blocks within pre tags', (done) => {
      const files = {
        'context.html': {
          contents: Buffer.from(`
            <pre><code class="language-javascript">const x = 1;</code></pre>
            <div>Look at this code: <code>const y = 2;</code></div>
          `)
        }
      };
      
      const plugin = metalsmithPrism();
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['context.html'].contents.toString();
        const $ = load(result);
        
        // Code within pre should be highlighted
        expect($('pre code').html()).to.include('token keyword');
        
        // Code outside pre should not be highlighted (even if it looks like code)
        expect($('div code').text()).to.equal('const y = 2;');
        done();
      });
    });

    it('should handle pre tags without language class', (done) => {
      const files = {
        'no-language-pre.html': {
          contents: Buffer.from(`
            <pre><code>console.log("no language");</code></pre>
            <pre><code class="other-class">console.log("other class");</code></pre>
          `)
        }
      };
      
      const plugin = metalsmithPrism();
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['no-language-pre.html'].contents.toString();
        const $ = load(result);
        
        // Code without language class should not be highlighted
        expect($('code').first().html()).to.equal('console.log("no language");');
        expect($('code').last().html()).to.equal('console.log("other class");');
        done();
      });
    });
  });

  describe('Complex Code Examples', () => {
    it('should correctly highlight complex real-world JavaScript', (done) => {
      const complexJs = `
        class Example extends Base {
          constructor(options = {}) {
            super();
            this.options = options;
            this.init();
          }
          
          async init() {
            try {
              await this.fetch();
            } catch (err) {
              console.error("Failed:", err.message);
            }
          }
        }
      `;
      
      const files = {
        'complex-js.html': {
          contents: Buffer.from(`<pre><code class="language-javascript">${complexJs}</code></pre>`)
        }
      };
      
      const plugin = metalsmithPrism();
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['complex-js.html'].contents.toString();
        
        // Should highlight classes, keywords, etc.
        expect(result).to.include('token keyword');
        expect(result).to.include('token class-name');
        expect(result).to.include('token function');
        done();
      });
    });

    it('should correctly highlight complex real-world CSS', (done) => {
      const complexCss = `
        .component {
          display: flex;
          position: relative;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .component::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: calc(100% - 20px);
          height: var(--height);
        }
        
        @media (max-width: 768px) {
          .component {
            flex-direction: column;
          }
        }
      `;
      
      const files = {
        'complex-css.html': {
          contents: Buffer.from(`<pre><code class="language-css">${complexCss}</code></pre>`)
        }
      };
      
      const plugin = metalsmithPrism();
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['complex-css.html'].contents.toString();
        
        // Should highlight selectors, properties, functions, etc.
        expect(result).to.include('token selector');
        expect(result).to.include('token property');
        expect(result).to.include('token function');
        done();
      });
    });

    it('should correctly highlight complex real-world HTML', (done) => {
      const complexHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Example</title>
          <style>
            body { font-family: sans-serif; }
          </style>
        </head>
        <body>
          <header>
            <nav>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
              </ul>
            </nav>
          </header>
          <main data-role="content">
            <h1 class="title">Hello World</h1>
            <p>This is a paragraph with <strong>bold</strong> text.</p>
          </main>
          <script>
            document.addEventListener('DOMContentLoaded', () => {
              console.log('Loaded');
            });
          </script>
        </body>
        </html>
      `;
      
      const files = {
        'complex-html.html': {
          contents: Buffer.from(`<pre><code class="language-markup">${complexHtml}</code></pre>`)
        }
      };
      
      const plugin = metalsmithPrism({
        decode: true  // HTML examples often need decoding
      });
      
      plugin(files, {}, (err) => {
        if (err) return done(err);
        
        const result = files['complex-html.html'].contents.toString();
        
        // Should highlight tags, attributes, etc.
        expect(result).to.include('token tag');
        expect(result).to.include('token attr-name');
        expect(result).to.include('token attr-value');
        done();
      });
    });
  });
});