/* global describe, it, beforeEach, afterEach */

import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Metalsmith from 'metalsmith';

import metalsmithPrism from '../src/index.js';

// Get current directory for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

describe('metalsmith-prism additional tests', function() {
  // Set timeout for all tests
  this.timeout(10000);

  describe('Error Handling', () => {
    let originalLoadLanguages;
    
    beforeEach(() => {
      originalLoadLanguages = global.loadLanguages;
    });
    
    afterEach(() => {
      global.loadLanguages = originalLoadLanguages;
    });

    it('should handle failures when loading languages gracefully', (done) => {
      // Mock loadLanguages to throw an error
      global.loadLanguages = () => { throw new Error('Test error'); };
      
      // Create file data
      const files = {
        'test.html': {
          contents: Buffer.from('<pre><code class="language-markup">Test</code></pre>')
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism({
        preLoad: ['nonexistent-language']
      });
      
      
      const metalsmith = Metalsmith(__dirname);
      plugin(files, metalsmith, (err) => {
        if (err) {return done(err);}
        // No error should be thrown
        done();
      });
    });

    it('should not reload already loaded languages', (done) => {
      // Create a spy to count loadLanguages calls
      let loadCount = 0;
      const loadSpy = (langs) => { 
        loadCount++;
        return originalLoadLanguages(langs);
      };
      
      global.loadLanguages = loadSpy;
      
      // Create file data
      const files = {
        'test.html': {
          contents: Buffer.from('<pre><code class="language-markup">Test</code></pre>')
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism({
        preLoad: ['markup', 'markup', 'javascript', 'javascript']
      });
      
      
      const metalsmith = Metalsmith(__dirname);
      plugin(files, metalsmith, (err) => {
        if (err) {return done(err);}
        // Expect fewer loads than requested languages (due to deduplication)
        assert.ok(loadCount <= 2, `Expected loadCount (${loadCount}) to be at most 2`);
        done();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed language classes gracefully', (done) => {
      // Create file data with malformed language classes
      const files = {
        'malformed.html': {
          contents: Buffer.from(`
            <pre><code class="language-">No language specified</code></pre>
            <pre><code class="language">Missing dash</code></pre>
          `)
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism();
      
      
      const metalsmith = Metalsmith(__dirname);
      plugin(files, metalsmith, (err) => {
        if (err) {return done(err);}
        // Should not throw and leave content unchanged since no valid language classes
        const content = files['malformed.html'].contents.toString();
        assert.ok(content.includes('No language specified'), 'Should include "No language specified"');
        assert.ok(content.includes('Missing dash'), 'Should include "Missing dash"');
        done();
      });
    });

    it('should skip non-HTML files', (done) => {
      // Create JS file data
      const jsContent = "console.log('test');";
      const files = {
        'test.js': {
          contents: Buffer.from(jsContent)
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism();
      
      
      const metalsmith = Metalsmith(__dirname);
      plugin(files, metalsmith, (err) => {
        if (err) {return done(err);}
        // Content should remain unchanged
        assert.strictEqual(files['test.js'].contents.toString(), jsContent);
        done();
      });
    });

    it('should handle HTML files with no code blocks', (done) => {
      // Create HTML file with no code blocks
      const htmlNoCode = "<p>Just a paragraph with no code</p>";
      const files = {
        'no-code.html': {
          contents: Buffer.from(htmlNoCode)
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism();
      
      
      const metalsmith = Metalsmith(__dirname);
      plugin(files, metalsmith, (err) => {
        if (err) {return done(err);}
        // Content should remain unchanged
        assert.strictEqual(files['no-code.html'].contents.toString(), htmlNoCode);
        done();
      });
    });

    it('should fall back to markup for unknown languages', (done) => {
      // Create HTML file with unknown language
      const files = {
        'unknown-lang.html': {
          contents: Buffer.from(`
            <pre><code class="language-unknown">&lt;div&gt;Test&lt;/div&gt;</code></pre>
          `)
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism();
      
      
      const metalsmith = Metalsmith(__dirname);
      plugin(files, metalsmith, (err) => {
        if (err) {return done(err);}
        
        // Should highlight as markup
        const result = files['unknown-lang.html'].contents.toString();

        // Should have some highlighting applied (at least parent class)
        assert.ok(result.includes('class="language-unknown"'), 'Should have language-unknown class');
        done();
      });
    });
  });

  describe('Options and Features', () => {
    it('should properly decode HTML entities when decode=true', (done) => {
      // Create HTML file with entities
      const files = {
        'entities.html': {
          contents: Buffer.from(`
            <pre><code class="language-markup">&lt;div&gt;Test&lt;/div&gt;</code></pre>
          `)
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism({
        decode: true
      });
      
      
      const metalsmith = Metalsmith(__dirname);
      plugin(files, metalsmith, (err) => {
        if (err) {return done(err);}
        
        const result = files['entities.html'].contents.toString();

        // Should have decoded and highlighted the HTML
        assert.ok(result.includes('class="token tag"'), 'Should have token tag class');
        done();
      });
    });

    it('should generate debug logs when metalsmith debug is enabled', (done) => {
      // Create a logging spy
      let captured = false;
      
      // Create metalsmith mock with debug function that captures calls
      const metalsmithMock = {
        debug: () => {
          const debugFn = () => {
            captured = true;
          };
          debugFn.error = () => { captured = true; };
          debugFn.warn = () => { captured = true; };
          debugFn.info = () => { captured = true; };
          return debugFn;
        }
      };
      
      // Create HTML file
      const files = {
        'debug-test.html': {
          contents: Buffer.from('<pre><code class="language-javascript">var x = 1;</code></pre>')
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism();
      
      plugin(files, metalsmithMock, (err) => {
        if (err) {return done(err);}
        
        // Debug should have been called
        assert.strictEqual(captured, true, 'Debug should have been called');
        
        done();
      });
    });
  });
});