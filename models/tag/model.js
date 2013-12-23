var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var value = {
	reports: [{type: ObjectId}],
	count: {type: Number}
}

var tagModel = {
	createdDate: {type: Date, "default": Date.now, index: true},
	updatedDate: {type: Date, "default": Date.now},
	count: {type: Number},
	value: {type: value},
	_id: {type: String}
};

var TagSchema = new Schema(tagModel);
var tag = mongoose.model('Tag', TagSchema);

var tagValidation = {
	properties:{
		createdDate: {
			description: 'Date that this tag was created in datastore',
			type: 'object'
		},
		updatedDate: {
			description: 'Date that this tag was last updated in datastore',
			type: 'object'
		},
		count: {
			description: 'The frequency of the tag value in all reports',
			type: 'number'
		},
		value: {
			description: 'The word tag found in a report',
			type: 'object'
		}
	}
};

exports.tag = tag;
exports.tagValidation = tagValidation;