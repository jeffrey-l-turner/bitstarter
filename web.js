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

/* // serve static file requests -- this must be placed last on app.get list 
app.get(/^(.+)$/, function(request, response){ 
    console.log('static file request : ' + request.params);
    var path = [request.params.size];
    path = 
    console.log("Calling stat with request.params = " + request.params + " path " + path);
    var size = fs.statSync(path).size;
    var buffer = new Buffer(size);
    console.log("Called fs.readFileSync with, buffer = " + buffer + "request = " + request);
//    buffer = fs.readFileSync(request.toString);
//    response.send(buffer.toString("utf-8", 0, size-1));
 });
*/


/* serve static image png file requests -- this must be placed last on app.get list */
 app.get(/^(.+).png$/, function(req, res){ 
    var path = __dirname + req.params[0] + '.png';
    console.log('static png file request: ' + path);
    var size = fs.statSync(path).size;
    var buffer = new Buffer(size);
    buffer = fs.readFileSync(path).toString();
    console.log('path: ' + path + ' size = ' + size);
    res.contentType('image/png');
    res.send(buffer);
 });

// {            'Content-Type': meta.contentType}

var port = process.env.PORT || 8080;
app.use(express.favicon('./favicon.ico'));
app.listen(port, function() {
  console.log("Listening on " + port);
});
