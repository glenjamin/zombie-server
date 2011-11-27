var express = require('express');

// Zombie is all .coffee
require('coffee-script');
var zombie = require('zombie');

exports.createServer = createServer;
function createServer() {
  return new Server();
}

exports.Server = Server;
function Server() {
  var server = this;
  this.started = false;
  var app = this.app = express.createServer();
  app.configure(function(){
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.errorHandler({ showStack: true }));
  });

  // TODO: modularise
  var prefix = '/browsers';
  var sessions = {};
  var sessionid = 0;
  function new_session(browser) {
    browser.id = ++sessionid;
    return sessions[sessionid] = browser;
  }
  function get_sessions() {
    var list = [];
    for (var i in sessions) list.push(sessions[i]);
    return list;
  }
  function get_session(sessionid) {
    return sessions[sessionid];
  }
  function browser_response(req, browser) {
    return {
      _links: {
        self: browser_path(req, browser),
        code: browser_path(req, browser, 'code'),
        location: browser_path(req, browser, 'location'),
        cookies: browser_path(req, browser, 'cookies'),
        html: browser_path(req, browser, 'html'),
        text: browser_path(req, browser, 'text'),
        css: browser_path(req, browser, 'css'),
        xpath: browser_path(req, browser, 'xpath'),
      },
      code: browser.statusCode,
      location: browser.location.href,
      redirected: browser.redirected
    }
  }
  function browser_path(req, browser, action) {
    if (!req.rest_endpoint) {
      var host = req.header('host', 'localhost:' + server.port);
      req.rest_endpoint = 'http://' + host + prefix;
    }
    return req.rest_endpoint + '/' + browser.id + (action ? '/' + action : '');
  }
  app.get(prefix, function(req, res) {
    var browsers = get_sessions().map(function(browser) {
      return { _links: { self: browser_path(req, browser) } };
    })
    res.json({browsers: browsers});
  })
  app.post(prefix, function(req, res, next) {
    var location = req.param('location');
    var options = {
      debug: !!req.param('debug'),
      runScripts: !!req.param('runScripts'),
      userAgent: req.param('userAgent')
    };
    zombie.visit(location, options, function(err, browser) {
      if (err) return next(err);
      new_session(browser);
      res.statusCode = 201;
      res.header('Location', browser_path(req, browser));
      res.json(browser_response(req, browser));
    })
  })
  app.get(prefix + '/:id/html', function(req, res) {
    var browser = get_session(req.param('id'));
    res.json({
      _links: { self: browser_path(req, browser, 'html') },
      html: browser.html()
    });
  });
}

Server.prototype.start = function start(port, callback) {
  var server = this;
  var app = this.app;
  // Turn EventEmitter error into plain callback error for init problems
  app.on('error', callback);
  app.listen(port, function() {
    app.removeListener('error', callback);
    server.started = true;
    server.port = port;
    return callback();
  });
}

Server.prototype.close = function() {
  this.app.close();
}
