/* global describe, it */

var chai = require('chai');
var metalsmith = require('metalsmith');
var metalsmithPrism = require('../lib');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;

var fixture = path.resolve.bind(path, __dirname, 'fixtures/markup');

function file(_path) {
  return fs.readFileSync(fixture(_path), 'utf8');
}

describe('metalsmith-prism', function() {

  it('should highlight code blocks for json, markup, ruby and bash', function(done) {

    var metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism())
      .build(function(err) {

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

  it('should NOT highlight unknown language code blocks', function(done) {

    var metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism())
      .build(function(err) {

        if (err) {
          return done(err);
        }

        expect(file('build/unknown.html')).to.be.eql(file('expected/unknown.html'));

        done();
      });
  });

  it('should decode markup blocks when options#decode is true', function(done) {

    var metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism({
        decode: true
      }))
      .build(function(err) {

        if (err) {
          return done(err);
        }

        expect(file('build/markup-encoded.html')).to.be.eql(file('expected/markup-encoded.html'));

        done();
      });

  });
});
