#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio, and restler. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + restler
   - https://github.com/danwrong/Restler/

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
// var testurl = require('restler');
var util = require('util');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

/* Could not get this to work; returns function from Build function again when trying to use
   Must be not understanding closure because function seems to be call built function twice
var notifyError = function(rtn) {
      if (rtn instanceof Error) {
         console.error('Error: ' + util.format(rtn.message));
         process.exit(1);
      }
    return false;
};
*/

var assertURLExists = function(url) {
//      testurl.get(url).on('complete', notifyError);   // Could not get this to work -- trying to perform intermediate url test consistent with Assert File test
      return url;
};

var checkANDoutput = function (json, dom) {
            var checks = loadChecks(json).sort();
                                                    console.error("result= " + result);                                       // Remove this after debug
            $ = cheerio.load(dom);
            var out = {};
            for (var ii in checks) {
                var present = $(checks[ii]).length > 0;
                                                    console.error("present= " + present + " checks[ii]= " + checks[ii]);      // Remove this after debug
                out[checks[ii]] = present;
            }
            var outJson = JSON.stringify(out, null, 4);
            console.log(outJson);
};

var buildFcn = function() {
    return { 
        "usage": function () { //first method
            console.error("Usage: buildFcn.afs(file, jsoncheck) is for reading filesystem async; buildFcn.url(jsoncheck) gets url");
        },

    "afs": function(file, jsoncheck) { var response2fs = function (err, data) { //function takes two paramaters for asynchronous file read -- error and data
              if (err instanceof Error) {
                  console.error('Error: ' + util.format(err.message));
                  process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
              } else
              checkANDoutput(jasoncheck, data);
        };
     return response2fs;
    };

    "url": function(jsoncheck) {var response2url = function(result) {  // function only takes one parameter for url
        if (result instanceof Error) {
            console.error('Error: ' + util.format(result.message));
            process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        } else  {
            checkANDoutput(jasoncheck, result);
        }};
    
    return response2url;
    }
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to html file for grading', clone(assertURLExists))
        .parse(process.argv);
    if (program.url) {
          var httpGetResponse = buildFcn.url(program.checks);
//          console.error("program.checks =" + program.checks + " ; program.url = " + program.url);
          rest.get(program.url).on('complete', httpGetResponse);
          }
    else { 
          console.error("checksfile =" + program.checks + " ; program.file = " + program.file);
          var err;
          var fsReadResponse = buildFcn.afs(err, program.checks);
          fs.readFile(program.file, fsReadResponse);
         }
} else {
    exports.checkHtmlFile = buildFcn;
}
