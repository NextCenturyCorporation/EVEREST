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

rawFeedValidation = {
	properties: {
		timestamp: {
			description: 'Time this raw feed was created in datastore',
			type: 'date'
		},
		text: {
			description: 'The contents of the raw feed',
			type: 'string'
		},
		feedSource: {
			description: 'The source of the raw feed',
			type: 'string',
			enum: ['Twitter', 'Email'],
			messages: {
				enum: 'Expected a source of Twitter or Email'
			}
		}
	}
};
