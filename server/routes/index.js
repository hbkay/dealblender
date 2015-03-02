/**
 * User Routes
 */

'use strict';

var indexController = require('../controllers/index');
var apiController = require('../controllers/api');
var path = require('path');
var fs = require('fs');

var routes = function(app) {

  // Dynamically load all routes
  fs.readdirSync(__dirname).forEach(function(file) {
    // Dont load this index.js file
    if (!/index/.test(file)) {
      var route = path.join(__dirname, file);
      require(route)(app);
    }
  });

  // Home
  app.get('/', indexController.index);

  // API
  app.get('/sources/', apiController.dealSources);
  app.get('/source/:name', apiController.dealSource);
};

module.exports = routes;
