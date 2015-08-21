/* global describe, it */

var chai = require('chai');
var metalsmith = require('metalsmith');
var metalsmithPrism = require('../lib');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;

var fixture = path.resolve.bind(path, __dirname, 'fixtures/markup');

function file(path) {
  return fs.readFileSync(fixture(path), 'utf8');
}

describe('metalsmith-prism', function() {

  it ('should highlight code blocks', function(done) {

    var metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism())
      .build(function(err){

        if(err) {
          return done(err);
        }

        expect(file('build/json.html')).to.be.eql(file('expected/json.html'));
        expect(file('build/markup.html')).to.be.eql(file('expected/markup.html'));
        expect(file('build/ruby.html')).to.be.eql(file('expected/ruby.html'));
        expect(file('build/bash.html')).to.be.eql(file('expected/bash.html'));

        done();
      });

  });

  it ('should not highlight unknown language code blocks', function(done) {

    var metal = metalsmith(fixture());

    metal
      .use(metalsmithPrism())
      .build(function(err){

        if(err) {
          return done(err);
        }

        expect(file('build/unknown.html')).to.be.eql(file('expected/unknown.html'));

        done();
      });
  });
});
