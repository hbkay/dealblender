'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId,
    Mixed = Schema.Types.Mixed;

var fields = {
	name: { type: String },
	deals: { type: Mixed } 
};

var dealsourceSchema = new Schema(fields);

module.exports = mongoose.model('DealSource', dealsourceSchema);
