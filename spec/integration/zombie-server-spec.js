var nodespec = require('./integration');

var app = require('./app');

nodespec.describe("INTEGRATION: browsers resource", function() {
  this.context("no sessions", function() {
    this.example("GET /browsers lists no sessions", function(test) {
      test.expect(2);
      test.zombies('GET', '/browsers', function(err, code, body) {
        if (err) return test.done(err);
        test.assert.equal(code, 200);
        test.assert.deepEqual(body, {browsers: []});
        return test.done();
      })
    })
    this.example("POST /browsers creates a session", function(test) {
      test.expect(5);
      var request_url = test.url('/');
      var request = { location: request_url };
      test.zombies('POST', '/browsers', request, function(err, code, body) {
        if (err) return test.done(err);
        test.assert.equal(code, 201);
        test.assert.equal(body._links.self, test.zombie_session(1));
        test.assert.equal(body.code, 200);
        test.assert.equal(body.location, request_url);
        test.assert.equal(body.redirected, false);
        return test.done();
      })
    })
  })

  this.context("1 session", function() {
    this.before(function(test) {
      var request = { location: test.url('/') };
      test.zombies('POST', '/browsers', request, test.done);
    })
    this.example("GET /browsers lists the session", function(test) {
      test.expect(2);
      test.zombies('GET', '/browsers', function(err, code, body) {
        if (err) return test.done(err);
        test.assert.equal(code, 200);
        test.assert.deepEqual(body, { browsers: [
          { _links: { self: test.zombie_session(1) } }
        ]});
        return test.done();
      })
    })
    this.example("GET /browsers/1/html returns page content", function(test) {
      test.zombies('GET', '/browsers/1/html', function(err, code, body) {
        if (err) return test.done(err);
        test.assert.equal(code, 200);
        test.assert(~body.html.indexOf('<h1>Home Page</h1>'));
        return test.done();
      })
    })
  })
});

nodespec.exec();
