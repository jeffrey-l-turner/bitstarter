#!/usr/bin/env node
// Starting edits to read index.html and serve to Heroku
var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
    response.send(indexbuffer.toString("ascii", 0, indexsize-1));
});



/* serve static image png file requests -- placing this near end of app.get list */
/*  app.get(/^(.+).png$/, function(req, res){ 
    var path = '';
    path = __dirname + req.params[0] + '.png';
    console.log('static png file request: ' + path);
    var size = fs.statSync(path).size;
    var buffer = new Buffer(size);
    buffer = fs.readFileSync(path).toString();
    console.log('path: ' + path + ' size = ' + size);
    res.contentType('image/png');
//    res.sendfile('/home/ubuntu/homework/bitstarter/index.html');
    res.sendfile(path, {root: __dirname});
//    res.send(buffer);
 });
<-- May add this back in later to serve specific static files based on type; used app.use(express.static(...)) to serve files out of static assets directory; see below
*/

// {            'Content-Type': meta.contentType}

var port = process.env.PORT || 8080;
app.use(express.favicon(__dirname + '/assets/favicon.ico'));
app.use(express.static(__dirname + '/assets'));
// Speedup by serving index file out of buffer by setting some global variables for app.get to use
var indexsize = fs.statSync("index.html").size;
var indexbuffer = new Buffer(indexsize);
indexbuffer = fs.readFileSync("index.html");
app.listen(port, function() {
  console.log("Listening on " + port);
});
