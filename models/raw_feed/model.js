var mongoose = require('mongoose');
var Schema = mongoose.Schema;

this.rawFeedModel = {
	createdDate: {type: Date, default: Date.now},
	updatedDate: {type: Date, defailt: Date.now},
	text: {type: String, required: true},
	feedSource: {type: String, enum: ['Twitter', 'Email'], required: true}
};

var rawFeedSchema = new Schema(this.rawFeedModel);
this.rawFeed = mongoose.model('rawFeed', rawFeedSchema);

this.rawFeedValidation = {
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
			enum: ['Twitter', 'Email'],
			messages: {
				enum: 'Expected a source of Twitter or Email'
			},
			required: true
		}
	}
};
