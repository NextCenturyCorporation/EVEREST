var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationDataModel = {
	createdDate: {type: Date},
	updatedDate: {type: Date},
	name: {type: String, required:true},
	latitude: {type: Number, required:true},
	longitude:	{type: Number, required: true},
	radius:	{type: Number, "default": 0, required: true}
};

var LocationSchema = new Schema(locationDataModel);
LocationSchema.index({_id : -1}, {unique: true});
var location = mongoose.model('Location', LocationSchema);

// Describe the JSON semantic validation schema
var locationValidation = {
	properties: {
		createdDate: {
			description: 'Date this location was created in datastore',
			type: 'date'
		},
		updatedDate: {
			description: 'Date this location was last updated in datastore',
			type: 'date'
		},
		name: {
			description: 'Name of the location',
			type: 'string',
			required: true
		},
		latitude: {
			description: 'Latitude value for the location',
			type: 'number',
			minimum: -90.0,
			maximum: 90.0,
			messages: {
				minimum: 'Expected number >= -90.0',
				maximum: 'Expected number <= 90.0'
			},
			required: true
		},
		longitude: {
			description: 'Longitude value for the location',
			type: 'number',
			minimum: -180.0,
			maximum: 180.0,
			messages: {
				minimum: 'Expected number >= -180.0',
				maximum: 'Expected number <= 180.0'
			},
			required: true
		},
		radius: {
			description: 'Radius in units of degrees',
			type: 'number',
			"default": 0,
			required: true
		}
	}	
};

exports.location = location;
exports.locationValidation = locationValidation;