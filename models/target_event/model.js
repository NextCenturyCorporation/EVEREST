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

var targetEventModel = {
	createdBy: {type: ObjectId},					// value supplied by the service of the profile creating the object
	updatedBy: {type: ObjectId},					// value supplied by the service of the profile updating the object
	createdDate: {type: Date, "default": Date.now},	// value supplied by the service
	updatedDate: {type: Date, "default": Date.now},	// value supplied by the service
	name: {type: String, required: true},			// text identifier of the event
	description: {type: String},					// description of the event
	event_horizon: {type: [event_horizon]},			// temporal aspect of target event
	place: {type: [place]},							// spatial aspect of target event
	tags: {type: [String]},							// tag category cloud for target event
	assertions: {type: [ObjectId]}					// collection of target_assertion ids that apply to this target_event -- structural aspect
};

var TargetEventSchema = new Schema(targetEventModel);
var targetEvent = mongoose.model('TargetEvent', TargetEventSchema);

//Describe the JSON semantic validation schema
var targetEventValidation = {
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

exports.targetEvent = targetEvent;
exports.targetEventValidation = targetEventValidation;