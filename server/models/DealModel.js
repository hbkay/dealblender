'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId,
    Mixed = Schema.Types.Mixed;

var fields = {
  site: { type: String },
  title: { type: String },
  date: { type: Date, default: Date.now },
  link: { type: String },
  image: { type: String },
  description: { type: String },
  price: { type: String },
  dealscore: { type: String },
};

var dealSchema = new Schema(fields);

module.exports = mongoose.model('Deal', dealSchema);