var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var event_horizon = new Schema({
	start_date: {type: Date, required: true},
	end_date: {type: Date},		//what if end_date and range are provided
	range: {type: Number}
});

var place = new Schema({
	latitude: {type: Number, required: true},
	longitude: {type: Number, required: true},
	radius: {type: Number, "default": 0, required: true}
});

var eventModel = {
	createdBy: {type: ObjectId},					// value supplied by the service of the profile creating the object
	updatedBy: {type: ObjectId},					// value supplied by the service of the profile updating the object
	createdDate: {type: Date, "default": Date.now},	// value supplied by the service
	updatedDate: {type: Date, "default": Date.now},	// value supplied by the service
	name: {type: String, required: true},			// text identifier of the event
	description: {type: String},					// description of the event
	event_horizon: {type: [event_horizon]},			// temporal aspect of event
	place: {type: [place]},							// spatial aspect of event
	tags: {type: [String]},							// tag category cloud for event
	assertions: {type: [ObjectId]}					// collection of assertion ids that apply to this event -- structural aspect
};

var eventSchema = new Schema(eventModel);
var event_ = mongoose.model('Event', eventSchema);

//Describe the JSON semantic validation schema
var eventValidation = {
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
exports.eventValidation = eventValidation;