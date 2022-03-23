// BASE SETUP
// =============================================================================

var cors = require("cors");
var express = require("express"); // call express
var app = express(); // define our app using express
const bodyParser = require("body-parser");
const path = require('path');
require("./app/cron-job/cron-job");
require('dotenv').config()

global.globalPath = __dirname;
// Create Database connection
require("./app/dbConnection");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({parameterLimit: 100000,
                               limit: '50mb',
                               extended: true}));
app.use(bodyParser.json({ limit: '50mb' }));
// console.log('testtt')
app.use(cors());

const port = process.env.PORT || 8000; // set our port

// ROUTES FOR OUR API
// =============================================================================
app.use(express.static(__dirname + '/public'));
require("./route")(app);

const allowedExt = ['.js', '.ico', '.css', '.png', '.jpg', '.woff2', '.woff', '.ttf', '.svg'];
app.get('*', function (req, res) {
  console.log("reeq. url", req.url);
  if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
    res.sendFile(path.resolve(`public/${req.url}`));
  } else {
    res.sendFile(path.resolve('public/index.html'));
  }
});

// ROOT ORG, USER, ROLES, BRANCH SETUP
require("./app/config/setup");
// START THE SERVER
// =============================================================================
app.listen(port);
console.log("Magic happens on port " + port);
exports = module.exports = app;
