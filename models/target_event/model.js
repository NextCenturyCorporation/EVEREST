var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var event_horizon = new Schema({
	start_date: {type: Date, required: true},
	end_date: {type: Date},		//what if end_date and range are provided
	range: {type: Number}
});

var location = new Schema({
	latitude: {type: Number, required: true},
	longitude: {type: Number, required: true},
	radius: {type: Number, "default": 0, required: true}
});

var targetEventModel = {
	createdBy: {type: Schema.Types.ObjectId},		// value supplied by the service of the profile creating the object
	updatedBy: {type: Schema.Types.ObjectId},		// value supplied by the service of the profile updating the object
	createdDate: {type: Date},									// value supplied by the service
	updatedDate: {type: Date},									// value supplied by the service
	name: {type: String, required: true},				// text identifier of the event
	description: {type: String},								// description of the event
	event_horizon: {type: [event_horizon]},			// temporal aspect of target event
	location: {type: [location]},								// spatial aspect of target event
	tags: {type: [String]},											// tag category cloud for target event
	assertions: {type: [Schema.Types.ObjectId]}	// collection of target_assertion ids that apply to this target_event -- structural aspect
};

var TargetEventSchema = new Schema(targetEventModel);
var targetEvent = mongoose.model('TargetEvent', TargetEventSchema);

//Describe the JSON semantic validation schema
var targetEventValidation = {
	properties: {
		createdDate: {
			description: 'Date this was created in datastore',
			type: 'date'
		},
		updatedDate: {
			description: 'Date this was last updated in datastore',
			type: 'date'
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