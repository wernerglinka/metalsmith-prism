/* global describe, it */

'use strict';

const chai = require('chai');
const metalsmith = require('metalsmith');
const metalsmithPrism = require('../lib');
const fs = require('fs');
const path = require('path');
const expect = chai.expect;

const fixture = path.resolve.bind(path, __dirname, 'fixtures/markup');
function file(_path) {
  return fs.readFileSync(fixture(_path), 'utf8');
}

// Seperate folder for pre-load test because metalsmith will try and compile all markup within folder and if
// the pre-load option isn't for for languages that exented another then the test will fail
const fixturePreload = path.resolve.bind(path, __dirname, 'fixtures/preload');
function filePreload(_path) {
  return fs.readFileSync(fixturePreload(_path), 'utf8');
}

describe('metalsmith-prism', () => {

  it('should highlight code blocks for json, markup, ruby and bash', done => {

    const metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism())
      .build( err => {

        if (err) {
          return done(err);
        }

        expect(file('build/json.html').toString().replace(/\s+/g, ' ').trim()).to.be.eql(file('expected/json.html').toString().replace(/\s+/g, ' ').trim());
        expect(file('build/markup.html').toString().replace(/\s+/g, ' ').trim()).to.be.eql(file('expected/markup.html').toString().replace(/\s+/g, ' ').trim());
        expect(file('build/ruby.html').toString().replace(/\s+/g, ' ').trim()).to.be.eql(file('expected/ruby.html').toString().replace(/\s+/g, ' ').trim());
        expect(file('build/bash.html').toString().replace(/\s+/g, ' ').trim()).to.be.eql(file('expected/bash.html').toString().replace(/\s+/g, ' ').trim());

        done();
      });

  });

  it('should NOT highlight unknown language code blocks', done => {

    const metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism())
      .build( err => {

        if (err) {
          return done(err);
        }

        expect(file('build/unknown.html')).to.be.eql(file('expected/unknown.html'));

        done();
      });
  });

  it('should decode markup blocks when options#decode is true', function(done) {

    const metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism({
        decode: true
      }))
      .build( err => {

        if (err) {
          return done(err);
        }

        expect(file('build/markup-encoded.html').toString().replace(/\s+/g, ' ').trim()).to.be.eql(file('expected/markup-encoded.html').toString().replace(/\s+/g, ' ').trim());

        done();
      });

  });

  it('should add language class to <pre> tag', function(done) {

    const metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism())
      .build( err => {

        if (err) {
          return done(err);
        }

        expect(file('build/line-numbers.html').toString().replace(/\s+/g, ' ').trim()).to.be.eql(file('expected/pre-classname.html').toString().replace(/\s+/g, ' ').trim());

        done();
      });

  });

  it('should add line numbers class to <pre> tag when options#lineNumbers is true', function(done) {

    const metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism({
        lineNumbers: true
      }))
      .build( err => {

        if (err) {
          return done(err);
        }

        expect(file('build/line-numbers.html').toString().replace(/\s+/g, ' ').trim()).to.be.eql(file('expected/line-numbers.html').toString().replace(/\s+/g, ' ').trim());

        done();
      });

  });

});
