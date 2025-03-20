/* global describe, it */

const assert = require('node:assert').strict;

// Import the plugin using CommonJS format
const metalsmithPrism = require('../lib/index.cjs');

describe('metalsmith-prism (CommonJS)', () => {
  // Verify the module loads correctly and exports a function
  it('should be properly importable as a CommonJS module', () => {
    assert.strictEqual(typeof metalsmithPrism, 'function', 'Plugin should be a function when required with CommonJS');
    assert.strictEqual(typeof metalsmithPrism(), 'function', 'Plugin should return a function when called');
  });
  
  // Add a basic functionality test to verify the plugin works
  it('should process simple code blocks correctly', (done) => {
    // Create a simple HTML file with a code block
    const files = {
      'test.html': {
        contents: Buffer.from('<pre><code class="language-javascript">const x = 1;</code></pre>')
      }
    };
    
    // Create basic metalsmith mock
    const metalsmithMock = {
      debug: () => () => {}
    };
    
    // Run the plugin directly
    const plugin = metalsmithPrism();
    
    plugin(files, metalsmithMock, (err) => {
      if (err) return done(err);
      
      // Check if highlighting was applied
      const result = files['test.html'].contents.toString();
      assert(result.includes('token'), 'Code block should be highlighted with token classes');
      done();
    });
  });
});