var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var eventHorizon = new Schema({
	start_date: {type: Date, required: true},
	end_date: {type: Date},		//what if end_date and range are provided
	range: {type: Number}
});

var place = new Schema({
	latitude: {type: Number, required: true},
	longitude: {type: Number, required: true},
	radius: {type: Number, "default": 0, required: true}
});

var event_Model = {
	createdBy: {type: ObjectId},					// value supplied by the service of the profile creating the object
	updatedBy: {type: ObjectId},					// value supplied by the service of the profile updating the object
	createdDate: {type: Date, "default": Date.now},	// value supplied by the service
	updatedDate: {type: Date, "default": Date.now},	// value supplied by the service
	name: {type: String, required: true},			// text identifier of the event
	description: {type: String},					// description of the event
	eventHorizon: {type: [eventHorizon]},			// temporal aspect of event
	place: {type: [place]},							// spatial aspect of event
	tags: {type: [String]},							// tag category cloud for event
	assertions: {type: [ObjectId]}					// collection of assertion ids that apply to this event -- structural aspect
};

var event_Schema = new Schema(event_Model);
var event_ = mongoose.model('Event_', event_Schema);

//Describe the JSON semantic validation schema
var event_Validation = {
	properties: {
		createdDate: {
			description: 'Date this was created in datastore',
			type: 'object'
		},
		updatedDate: {
			description: 'Date this was last updated in datastore',
			type: 'object'
		},
		name: {
			description: 'Name of the event',
			type: 'string',
			required: true
		},
		description: {
			description: 'Description of the event',
			type: 'string'
		}
	}
};

exports.event_ = event_;
exports.event_Validation = event_Validation;