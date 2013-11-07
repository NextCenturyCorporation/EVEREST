var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rawFeedModel = {
	createdDate: {type: Date, "default": Date.now, index: true},
	updatedDate: {type: Date, "default": Date.now},
	text: {type: String, required: true},
	feedSource: {type: String, enum: ['Twitter', 'Email', 'RSS'], required: true, index: true}
};

var rawFeedSchema = new Schema(rawFeedModel);
var rawFeed = mongoose.model('rawFeed', rawFeedSchema);

var rawFeedValidation = {
	properties: {
		createdDate: {
			description: 'Date created in datastore',
			type: 'date'
		},
		updatedDate: {
			description: 'Date last updated in datastore',
			type: 'date'
		},
		text: {
			description: 'The contents of the raw feed',
			type: 'string',
			required: true
		},
		feedSource: {
			description: 'The source of the raw feed',
			type: 'string',
			enum: ['Twitter', 'Email', 'RSS'],
			messages: {
				enum: 'Expected a source of Twitter or Email'
			},
			required: true
		}
	}
};

exports.rawFeed = rawFeed;
exports.rawFeedValidation = rawFeedValidation;