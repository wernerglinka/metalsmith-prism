/* global describe, it */

var chai = require('chai');
var metalsmith = require('metalsmith');
var metalsmithPrism = require('../lib');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;

describe('metalsmith-prism', function() {

  it('should highlight code blocks in html files', function(done) {

    var metal = metalsmith(path.join(__dirname, 'fixtures'));

    metal
      .use(metalsmithPrism())
      .build(function(err){

        if(err) {
          return done(err);
        }

        var buildContent = fs.readFileSync(path.join(__dirname, 'fixtures/build/markup.html'), "utf8");
        var expectedContent  = fs.readFileSync(path.join(__dirname, 'fixtures/expected/markup.html'), "utf8");

        expect(buildContent).to.be.eql(expectedContent);

        done();
      });
  });

  it ('should highlight multiple languages', function(done) {

    var metal = metalsmith(path.join(__dirname, 'fixtures'));

    metal
      .use(metalsmithPrism())
      .build(function(err){

        if(err) {
          return done(err);
        }

        var buildContent = fs.readFileSync(path.join(__dirname, 'fixtures/build/multiple.html'), "utf8");
        var expectedContent  = fs.readFileSync(path.join(__dirname, 'fixtures/expected/multiple.html'), "utf8");

        expect(buildContent).to.be.eql(expectedContent);

        done();
      });

  });
});
