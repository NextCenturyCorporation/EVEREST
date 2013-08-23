var mongoose = require('mongoose');
var Schema = mongoose.Schema;

 var twitterKeyModel = {
	createdDate: {type: Date, "default": Date.now},
	updatedDate: {type: Date, "default": Date.now},
	consumer_key: {type: String, required: true},
	consumer_secret: {type: String, required: true},
	access_token_key: {type: String, required: true},
	access_token_secret: {type: String, required: true}
};

var twitterKeySchema = new Schema(twitterKeyModel);
var twitterKey = mongoose.model('twitterKey', twitterKeySchema);

var twitterKeyValidation = {
	properties: {
		createdDate: {
			description: 'Date created in datastore',
			type: 'date'
		},
		updatedDate: {
			description: 'Date last updated in datastore',
			type: 'date'
		},
		consumer_key: {
			type: 'string',
			required: true,
			decsription: 'Consumer key as provided by Twitter'
		},
		consumer_secret: {
			type: 'string',
			required: true,
			description: 'Consumer secret as provided by Twitter'
		},
		access_token_key: {
			type: 'string',
			required: true,
			description: 'Access token key as provided by Twitter'
		},
		access_token_secret: {
			type: 'string',
			required: true,
			description: 'Access token secret as provided by Twitter'
		}
	}
};

exports.twitterKey = twitterKey;
exports.twitterKeyValidation = twitterKeyValidation;
