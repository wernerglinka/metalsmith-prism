/* global describe, it */

var chai = require('chai');
var metalsmith = require('metalsmith');
var metalsmithPrism = require('../lib');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;
var fixture = path.resolve.bind(path, __dirname, 'fixtures');

function fixtureContent(path) {
  return fs.readFileSync(fixture(path), 'utf8');
};

describe('metalsmith-prism', function() {

  it('should highlight code blocks in html files', function(done) {

    var metal = metalsmith(fixture('markup'));

    metal
      .use(metalsmithPrism())
      .build(function(err){

        if(err) {
          return done(err);
        }

        var buildContent = fixtureContent('markup/build/markup.html');
        var expectedContent  = fixtureContent('markup/expected/markup.html');

        expect(buildContent).to.be.eql(expectedContent);

        done();
      });
  });

  it ('should highlight multiple languages', function(done) {

    var metal = metalsmith(fixture('multiple'));

    metal
      .use(metalsmithPrism())
      .build(function(err){

        if(err) {
          return done(err);
        }

        var buildContent = fixtureContent('multiple/build/multiple.html');
        var expectedContent  = fixtureContent('multiple/expected/multiple.html');

        expect(buildContent).to.be.eql(expectedContent);

        done();
      });

  });
});
