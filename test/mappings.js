var supertest = require('supertest');
var path      = require('path');

var serveWaterfall = require('../lib');

var FIXTURES = path.join(__dirname, 'fixtures');

describe('mappings', function() {

  describe('STATIC', function() {

    var app;
    beforeEach(function() {
      app = serveWaterfall(serveWaterfall.mappings.STATIC, {root: FIXTURES});
    });

    it('serves files from the root', function(done) {
      supertest(app)
          .get('/x-foo/x-foo.html')
          .expect(200)
          .expect('x-foo\n', done);
    });

  });

  describe('WEB_COMPONENT', function() {

    var app;
    beforeEach(function() {
      app = serveWaterfall(serveWaterfall.mappings.WEB_COMPONENT, {
        root: path.join(FIXTURES, 'x-foo'),
      });
    });

    it('serves own files from /components/<basename>', function(done) {
      supertest(app)
          .get('/components/x-foo/x-foo.html')
          .expect(200)
          .expect('x-foo\n', done);
    });

    it('serves dependencies from bower_components', function(done) {
      supertest(app)
          .get('/components/x-baz/x-baz.html')
          .expect(200)
          .expect('bower x-baz\n', done);
    });

    it('prefers dependencies from bower_components over siblings', function(done) {
      supertest(app)
          .get('/components/x-bar/x-bar.html')
          .expect(200)
          .expect('bower x-bar\n', done);
    });

    it('serves files from the root', function(done) {
      supertest(app)
          .get('/x-foo.html')
          .expect(200)
          .expect('x-foo\n', done);
    });

  });

});
