var path = require('path'),
    fs = require('fs');

var models = {};
// Bootstrap models
var modelsPath = path.join(__dirname, '../models');
console.log(modelsPath);
fs.readdirSync(modelsPath).forEach(function (file) {

  var key = path.basename(file, '.js')
  models[key] = require(modelsPath + '/' + file);
});

module.exports = models;