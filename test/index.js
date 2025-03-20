 

import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import * as chai from 'chai';
const { expect } = chai;
import { load } from 'cheerio';

import metalsmith from 'metalsmith';

// Import the plugin directly from src for accurate coverage
import metalsmithPrism from '../src/index.js';

// Get current directory and setup path utilities
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Creates a path resolver for a specific fixture directory
 * @param {string} dir - The fixture directory name
 * @returns {Function} A function that resolves paths within the fixture directory
 */
const getFixturePath = (dir) => resolve.bind(null, __dirname, `fixtures/${dir}`);

/**
 * Reads a fixture file and returns its contents
 * @param {string} dir - The fixture directory name
 * @param {string} filepath - The path to the file within the fixture directory
 * @returns {string} The contents of the file
 */
const readFixture = (dir, filepath) => readFileSync(getFixturePath(dir)(filepath), 'utf8');

/**
 * Extracts and normalizes code content from HTML
 * @param {string} html - The HTML content containing code blocks
 * @returns {string} Normalized code content with consistent whitespace
 * @description
 * Handles common Cheerio whitespace quirks:
 * - Cheerio sometimes adds/removes spaces between tags
 * - Different environments might format HTML differently
 * - Code formatting tools might add their own spacing
 * - Line endings might be different
 *
 * Makes tests more reliable because it focuses on the content structure
 * rather than exact spacing matches.
 */
const getCodeContent = (html) => {
  const $ = load(html, { decodeEntities: false });
  return $('code')
    .html()
    .replace(/\s+/g, ' ') // normalize all whitespace to single space
    .replace(/>\s+</g, '><') // remove space between tags
    .replace(/\s*([=:])\s*/g, '$1') // remove space around = and :
    .replace(/\s*([,;])/g, '$1') // remove space before , and ;
    .replace(/\(\s+/g, '(') // remove space after (
    .replace(/\s+\)/g, ')') // remove space before )
    .replace(/\[\s+/g, '[') // remove space after [
    .replace(/\s+\]/g, ']') // remove space before ]
    .trim();
};

describe('metalsmith-prism (ESM)', function () {
  // Set timeout for all tests
  this.timeout(10000);

  // Verify ESM module loading
  it('should be importable as an ES module', () => {
    assert.strictEqual(typeof metalsmithPrism, 'function', 'Plugin should be a function when imported with ESM');
    assert.strictEqual(typeof metalsmithPrism(), 'function', 'Plugin should return a function when called');
  });

  describe('Basic Syntax Highlighting', () => {
    it('should highlight code blocks for json, markup, ruby, and bash', (done) => {
      const metal = metalsmith(getFixturePath('markup')());

      metal.use(metalsmithPrism()).build((err) => {
        if (err) {
          return done(err);
        }

        const tests = ['json', 'markup', 'ruby', 'bash'];

        try {
          tests.forEach((type) => {
            const build = readFixture('markup', `build/${type}.html`);
            const expected = readFixture('markup', `expected/${type}.html`);
            expect(getCodeContent(build), `Failed to properly highlight ${type} code`).to.be.eql(
              getCodeContent(expected)
            );
          });
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should NOT highlight unknown language code blocks', (done) => {
      const metal = metalsmith(getFixturePath('markup')());

      metal.use(metalsmithPrism()).build((err) => {
        if (err) {
          return done(err);
        }

        try {
          const build = readFixture('markup', 'build/unknown.html');
          const expected = readFixture('markup', 'expected/unknown.html');
          expect(getCodeContent(build), 'Unknown language code block was modified').to.be.eql(getCodeContent(expected));
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('Language Preloading', () => {
    it('should pre-load and register language components for java, and then highlight code block for scala', (done) => {
      const metal = metalsmith(getFixturePath('preload')());

      metal
        .use(
          metalsmithPrism({
            preLoad: ['java']
          })
        )
        .build((err) => {
          if (err) {
            return done(err);
          }

          try {
            const build = readFixture('preload', 'build/scala.html');
            const expected = readFixture('preload', 'expected/scala.html');
            expect(getCodeContent(build), 'Scala code was not properly highlighted with Java components').to.be.eql(
              getCodeContent(expected)
            );
            done();
          } catch (error) {
            done(error);
          }
        });
    });
  });

  describe('PHP Support', () => {
    it('should highlight basic PHP code blocks correctly', (done) => {
      const metal = metalsmith(getFixturePath('markup')());

      metal
        .use(
          metalsmithPrism({
            decode: true
          })
        )
        .build((err) => {
          if (err) {
            return done(err);
          }

          try {
            const build = readFixture('markup', 'build/php.html');
            const expected = readFixture('markup', 'expected/php.html');
            expect(getCodeContent(build), 'Basic PHP syntax was not properly highlighted').to.be.eql(
              getCodeContent(expected)
            );
            done();
          } catch (error) {
            done(error);
          }
        });
    });

    it('should highlight advanced PHP features correctly', (done) => {
      const metal = metalsmith(getFixturePath('markup')());

      metal
        .use(
          metalsmithPrism({
            decode: true,
            preLoad: ['markup', 'php']
          })
        )
        .build((err) => {
          if (err) {
            return done(err);
          }

          try {
            const build = readFixture('markup', 'build/php-advanced.html');
            const expected = readFixture('markup', 'expected/php-advanced.html');
            expect(getCodeContent(build), 'Advanced PHP features were not properly highlighted').to.be.eql(
              getCodeContent(expected)
            );
            done();
          } catch (error) {
            done(error);
          }
        });
    });
  });

  describe('HTML Features', () => {
    it('should decode markup blocks when options#decode is true', (done) => {
      const metal = metalsmith(getFixturePath('markup')());

      metal
        .use(
          metalsmithPrism({
            decode: true
          })
        )
        .build((err) => {
          if (err) {
            return done(err);
          }

          try {
            const build = readFixture('markup', 'build/markup-encoded.html');
            const expected = readFixture('markup', 'expected/markup-encoded.html');
            expect(getCodeContent(build), 'Encoded markup was not properly decoded').to.be.eql(
              getCodeContent(expected)
            );
            done();
          } catch (error) {
            done(error);
          }
        });
    });

    it('should add language class to <pre> tag', (done) => {
      const metal = metalsmith(getFixturePath('markup')());

      metal.use(metalsmithPrism()).build((err) => {
        if (err) {
          return done(err);
        }

        try {
          const build = readFixture('markup', 'build/line-numbers.html');
          const expected = readFixture('markup', 'expected/pre-classname.html');
          expect(getCodeContent(build), 'Language class was not added to pre tag').to.be.eql(getCodeContent(expected));
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should add line numbers class to <pre> tag when options#lineNumbers is true', (done) => {
      const metal = metalsmith(getFixturePath('markup')());

      metal
        .use(
          metalsmithPrism({
            lineNumbers: true
          })
        )
        .build((err) => {
          if (err) {
            return done(err);
          }

          try {
            const build = readFixture('markup', 'build/line-numbers.html');
            const expected = readFixture('markup', 'expected/line-numbers.html');
            expect(getCodeContent(build), 'Line numbers class was not added to pre tag').to.be.eql(
              getCodeContent(expected)
            );
            done();
          } catch (error) {
            done(error);
          }
        });
    });
  });
});
