/**
 * Api Controller
 */

'use strict';

var settings = require('../config/env/default');
var models = require('../config/models');
var path = require('path');

var deals = function (req, res) {
  models.DealModel.find(function (err, source) {
    if (err) throw err;
    res.json(source);
  });
}


module.exports = {
  deals: deals,
}