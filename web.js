#!/usr/bin/env node
// Starting edits to read index.html and serve to Heroku
var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var buffer = new Buffer(2314);
  buffer = fs.readFileSync("index.html");
  response.send(buffer.toString("ascii", 0, 2313));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
