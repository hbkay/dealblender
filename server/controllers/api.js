/**
 * Api Controller
 */

'use strict';

var settings = require('../config/env/default');
var models = require('../config/models');
var path = require('path');

var dealSources = function (req, res) {  

  models.DealSource.find(function (err, source) {
    if (err) throw err;
    res.json(source);
  });
};

var dealSource = function (req, res) {  
  var name = req.params.name;

  models.DealSource.find({ name: name }, function (err, source) {
    if (err) throw err;
    res.json(source);
  });
};

module.exports = {
  dealSources: dealSources,
  dealSource: dealSource,
}