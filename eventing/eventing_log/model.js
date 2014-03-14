var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var eventingLogModel = {
	createdDate: {type: Date, "default": Date.now, index: true},
	event_type: {type: String, required: true},
	previous_events: {type: [ObjectId]}
}

var EventingLogSchema = new Schema(eventingLogModel);
var eventingLog = mongoose.model('EventingLog', EventingLogSchema);

var eventingLogValidation = {
	properties:{
		createdDate: {
			description: 'Date that this eventing log was created in datastore',
			type: 'object'
		},
		event_type: {
			description: "The events type for this log",
			type: 'string',
			required: true
		}
	}
};

exports.eventingLog = eventingLog;
exports.eventingLogValidation = eventingLogValidation;