var express = require('express');

var app = express.createServer();
exports.app = app;

app.get('/', function(req, res) {
  res.end(exports.homepage);
})

exports.homepage = htmlpage('<h1>Home Page</h1>');
function htmlpage(body) {
  return '' +
    '<html><head><title>Sample App</title></head><body>' +
    body +
    '</body></html>';
}
