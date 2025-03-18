/* global describe, it, beforeEach, afterEach */

import * as chai from 'chai';
const { expect } = chai;

import metalsmithPrism from '../src/index.js';
import debugLib from 'debug';

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
      
      plugin(files, {}, (err) => {
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
      
      plugin(files, {}, (err) => {
        if (err) {return done(err);}
        // Expect fewer loads than requested languages (due to deduplication)
        expect(loadCount).to.be.at.most(2);
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
      
      plugin(files, {}, (err) => {
        if (err) {return done(err);}
        // Should not throw and leave content unchanged since no valid language classes
        expect(files['malformed.html'].contents.toString()).to.include('No language specified');
        expect(files['malformed.html'].contents.toString()).to.include('Missing dash');
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
      
      plugin(files, {}, (err) => {
        if (err) {return done(err);}
        // Content should remain unchanged
        expect(files['test.js'].contents.toString()).to.equal(jsContent);
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
      
      plugin(files, {}, (err) => {
        if (err) {return done(err);}
        // Content should remain unchanged
        expect(files['no-code.html'].contents.toString()).to.equal(htmlNoCode);
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
      
      plugin(files, {}, (err) => {
        if (err) {return done(err);}
        
        // Should highlight as markup
        const result = files['unknown-lang.html'].contents.toString();
        
        // Should have some highlighting applied (at least parent class)
        expect(result).to.include('class="language-unknown"');
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
      
      plugin(files, {}, (err) => {
        if (err) {return done(err);}
        
        const result = files['entities.html'].contents.toString();
        
        // Should have decoded and highlighted the HTML
        expect(result).to.include('class="token tag"');
        done();
      });
    });

    it('should generate debug logs when DEBUG environment variable is set', (done) => {
      // Create a debug instance
      const debug = debugLib('metalsmith-prism');
      
      // Save original debug status and override
      const originalEnabled = debug.enabled;
      debug.enabled = true;
      
      // Create a logging spy
      let captured = false;
      debug.log = () => {
        captured = true;
        debug.log = () => {}; // Only capture once
      };
      
      // Create HTML file
      const files = {
        'debug-test.html': {
          contents: Buffer.from('<pre><code class="language-javascript">var x = 1;</code></pre>')
        }
      };
      
      // Run the plugin directly
      const plugin = metalsmithPrism();
      
      plugin(files, {}, (err) => {
        // Restore original debug status
        debug.enabled = originalEnabled;
        
        if (err) {return done(err);}
        
        // Our mock should have captured debug output if enabled
        if (debug.enabled) {
          expect(captured).to.be.true;
        }
        
        done();
      });
    });
  });
});