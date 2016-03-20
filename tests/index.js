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

describe('metalsmith-prism', () => {

  it('should highlight code blocks for json, markup, ruby and bash', done => {

    const metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism())
      .build( err => {

        if (err) {
          return done(err);
        }

        expect(file('build/json.html')).to.be.eql(file('expected/json.html'));
        expect(file('build/markup.html')).to.be.eql(file('expected/markup.html'));
        expect(file('build/ruby.html')).to.be.eql(file('expected/ruby.html'));
        expect(file('build/bash.html')).to.be.eql(file('expected/bash.html'));

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

        expect(file('build/markup-encoded.html')).to.be.eql(file('expected/markup-encoded.html'));

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

        expect(file('build/line-numbers.html')).to.be.eql(file('expected/line-numbers.html'));

        done();
      });

  });

});
