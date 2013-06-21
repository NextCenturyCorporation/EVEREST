/*global require*/
// Identify require as a global function/keyword for JSHint

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var config = require('../../config.js');

this.rawFeedModel = {
	timestamp: {type: Date, "default": Date.now},
	text: String,
	feedSource: {type: String, enum: ['Twitter', 'Email']}
};

var rawFeedSchema = new Schema(this.rawFeedModel);
this.rawFeed = mongoose.model('rawFeed', rawFeedSchema);
