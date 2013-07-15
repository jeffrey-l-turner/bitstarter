#!/usr/bin/env node
// Starting edits to read index.html and serve to Heroku
var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var size = fs.statSync("index.html").size;
  var buffer = new Buffer(size);
  buffer = fs.readFileSync("index.html");
  response.send(buffer.toString("ascii", 0, size-1));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
