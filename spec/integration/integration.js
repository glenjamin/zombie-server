var nodespec = require('../common');

var http = require('http');
var url = require('url');

var app = require('./app').app;

var ZOMBIES_PORT = 7668;

var SAMPLE_PORT = 7669;
var RETRY_LIMIT = 10;

var zombies = require('../../lib/zombie-server');
var server;
startZombies = function(callback) {
  if (server) server.close();
  server = zombies.createServer();
  server.start(ZOMBIES_PORT, callback);
}

startSampleApp = function(callback/*(err, base_url)*/) {
  if (app.listening) {
    var address = app.address();
    return callback(null, 'http://127.0.0.1:' + address.port);
  }
  var port = SAMPLE_PORT, attempts = 0;
  app.on('error', try_next_port);
  function try_next_port(err) {
    if (++attempts >= RETRY_LIMIT) throw err;
    app.listen(++port, '127.0.0.1');
  }
  return app.listen(port, '127.0.0.1', function() {
    app.removeListener('error', try_next_port);
    app.listening = true;
    callback(null, 'http://127.0.0.1:' + port);
  });
}

nodespec.before(function(test) {
  startSampleApp(function(err, base) {
    if (err) return test.done(err);
    test.url = function(path) {
      return base + path;
    }
    startZombies(function(err) {
      if (err) return test.done(err);
      test.zombie_session = function(id) {
        return 'http://127.0.0.1:' + ZOMBIES_PORT + '/browsers/' + id;
      }
      test.zombies = function(method, path, body, callback) {
        if (!callback) { callback = body; body = null; }
        var options = {
          host: '127.0.0.1', port: ZOMBIES_PORT,
          method: method.toUpperCase(), path: path,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
        var req = http.request(options , function(res) {
          res.setEncoding('utf8');
          var data = '';
          res.on('data', function(chunk) { data += chunk })
          res.on('error', callback)
          res.on('end', function() {
            if (/json/.test(res.headers['content-type'])) {
              try { data = JSON.parse(data) }
              catch (ex) { return callback(ex) }
            }
            if (res.statusCode == 500 && data.error) {
              return callback(data.error);
            }
            return callback(null, res.statusCode, data)
          })
        })
        if (body) req.write(JSON.stringify(body))
        req.end()
      }
      test.done(err)
    })
  })
})

module.exports = nodespec;
