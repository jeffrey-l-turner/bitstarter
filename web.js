#!/usr/bin/env node
// Updated Bitstarter Final Project

var async   = require('async')
  , express = require('express')
  , fs      = require('fs')
  , http    = require('http')
  , https   = require('https')
  , db      = require('./models');

// Setup file locations
var ASSET_DIR = '/assets';

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('title', 'Cambix.org Scaling the Bitcoin Economy');

// Return favicon and static elements -- gifs, etc.
app.use(express.favicon(__dirname + ASSET_DIR + '/favicon.ico', {maxAge: 86400000}));
app.use(express.static(__dirname + ASSET_DIR));

// Middleware to re-write URLs & remove trailing '/'
app.use(function(req, res, next) {
  if (req.url.slice(-1) === '/') {
    req.url = req.url.slice(0, -1);
  }
  next();
});

// Remove trailing # to end of URL
app.use(function(req, res, next) {
  console.log("Stripping url: " + req.url);
  req.url = req.url.replace(/#+$/, ""); 
  next();
});

// simple logger
app.use(function(req, res, next){
  console.log('req.method: %s; req.url: %s', req.method, req.url);
  next();
});

// Cache index.html to speed up re-processing of ("single page") app
var indexsize = fs.statSync("index.html").size;
var indexbuffer = new Buffer(indexsize).toString();
indexbuffer = fs.readFileSync("index.html");
app.set('port', process.env.PORT || 8080);

// Render homepage (note trailing slash): example.com/
app.get('/', function(request, response) {
  response.send(indexbuffer.toString("ascii", 0, indexsize-1));
});

// Features
app.get('/features', function(request, response) {
    console.log("Features link clicked; request.url: " + request.url);
    response.send(fs.readFileSync('features.html').toString());
    });

// Contact
app.get('contact', function(request, response) {
    console.log("Contact link clicked");
    response.send(fs.readFileSync('index.html').toString());
    });

// Design
app.get('/design', function(request, response) {
    console.log("Design link clicked");
    response.send(fs.readFileSync('design.html').toString());
    });

// About
app.get('about', function(request, response) {
    response.send(indexbuffer.toString("ascii", 0, indexsize-1));
    console.log("About link clicked");
    });

// Render example.com/donations
app.get('/donations', function(request, response) {
  global.db.Order.findAll().success(function(orders) {
    var orders_json = [];
    orders.forEach(function(order) {
      orders_json.push({id: order.coinbase_id, amount: order.amount, time: order.time});
    });
    // Uses views/orders.ejs
    response.render("orders", {orders: orders_json});
  }).error(function(err) {
    console.log(err);
    response.send("error retrieving orders");
  });
});

// Hit this URL while on example.com/orders to refresh
app.get('/refresh_orders', function(request, response) {
  https.get("https://coinbase.com/api/v1/orders?api_key=" + process.env.COINBASE_API_KEY, function(res) {
    var body = '';
    res.on('data', function(chunk) {body += chunk;});
    res.on('end', function() {
      try {
        var orders_json = JSON.parse(body);
        if (orders_json.error) {
          response.send(orders_json.error);
          return;
        }
        // add each order asynchronously
        async.forEach(orders_json.orders, addOrder, function(err) {
          if (err) {
            console.log(err);
            response.send("error adding orders");
          } else {
            // orders added successfully
            response.redirect("/donations");
          }
        });
      } catch (error) {
        console.log(error);
        response.send("error parsing json");
      }
    });

    res.on('error', function(e) {
      console.log(e);
      response.send("error syncing orders within /refresh_orders");
    });
  });
});

// sync the database and start the server
db.sequelize.sync().complete(function(err) {
  if (err) {
    throw err;
  } else {
    http.createServer(app).listen(app.get('port'), function() {
      console.log("Listening on " + app.get('port'));
    });
  }
});

// add order to the database if it doesn't already exist
var addOrder = function(order_obj, callback) {
  var order = order_obj.order; // order json from coinbase
  if (order.status != "completed") {
    // only add completed orders
    callback();
  } else {
    var Order = global.db.Order;
    // find if order has already been added to our database
    Order.find({where: {coinbase_id: order.id}}).success(function(order_instance) {
      if (order_instance) {
        // order already exists, do nothing
        callback();
      } else {
        // build instance and save
          var new_order_instance = Order.build({
          coinbase_id: order.id,
          amount: order.total_btc.cents / 100000000, // convert satoshis to BTC
          time: order.created_at
        });
          new_order_instance.save().success(function() {
          callback();
        }).error(function(err) {
          callback(err);
        });
      }
    });
  }
};

app.use(redirectUnmatched);                    // redirect if nothing else sent a response

function redirectUnmatched(req, res) {
  res.redirect("/");
};
