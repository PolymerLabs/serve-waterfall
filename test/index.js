var expect    = require('chai').expect;
var express   = require('express');
var path      = require('path');
var supertest = require('supertest');

var waterfallServe = require('../lib');

var FIXTURES = path.join(__dirname, 'fixtures');

describe('waterfallServe', function() {

  it('uses the current directory as root by default', function(done) {
    process.chdir(FIXTURES);
    supertest(waterfallServe(waterfallServe.mappings.STATIC))
        .get('/x-bar/x-bar.html')
        .expect(200)
        .expect('x-bar\n', done);
  });

  it('supports options.headers', function(done) {
    var app = waterfallServe(waterfallServe.mappings.STATIC, {
      root: FIXTURES,
      headers: {
        'X-Thing': 'abc123',
        'X-Stuff': 'foobar',
      }
    });
    supertest(app)
        .get('/x-foo/x-foo.html')
        .expect('X-Thing', 'abc123')
        .expect('X-Stuff', 'foobar', done);
  });

  it('responds with ETag', function(done) {
    supertest(waterfallServe(waterfallServe.mappings.STATIC, {root: FIXTURES}))
        .get('/x-foo/x-foo.html')
        .expect('ETag', /.+/, done);
  });

  it('supports raw send options', function(done) {
    var app = waterfallServe(waterfallServe.mappings.STATIC, {
      root: FIXTURES,
      sendOpts: {etag: false},
    });
    supertest(app)
        .get('/x-foo/x-foo.html')
        .expect(function(response) {
          expect(response.headers.ETag).eq(undefined);
        })
        .end(done);
  });

  it('does not escape root', function(done) {
    supertest(waterfallServe(waterfallServe.mappings.STATIC, {root: FIXTURES}))
        .get('/../mappings.js')
        .expect(404)
        .expect('Not Found', done);
  });

  describe('with express', function() {

    var app;
    beforeEach(function() {
      app = express();
      app.use(waterfallServe(waterfallServe.mappings.STATIC));
    });

    it('works as expected', function(done) {
      supertest(app)
          .get('/x-foo/x-foo.html')
          .expect(200)
          .expect('x-foo\n', done);
    });

    it('falls back to additional middleware', function(done) {
      app.use(function(request, response) {
        response.end('final middleware');
      });

      supertest(app)
          .get('/not/a/thing')
          .expect('final middleware', done);
    });

  });

});
