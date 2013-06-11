var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config.js');

this.rawFeedModel = {
	date	: Date,
	text	: String
};

var rawFeedSchema = new Schema(this.rawFeedModel);
this.rawFeed = mongoose.model('rawFeed', rawFeedSchema);