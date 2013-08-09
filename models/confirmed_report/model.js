var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var confirmedReportModel = {
	created_date: {type: Date, default: Date.now},
	updated_date: {type: Date, default: Date.now},
	alpha_report_id: {type: Schema.Types.ObjectId, required: true},
	target_event_id: {type: Schema.Types.ObjectId},
	target_event_percentage: {type: Number, default: 1.0},
	profile_id: {type: Schema.Types.ObjectId},
	confirmed_date: {type: Date},
	assertions: [{type: Schema.Types.ObjectId}]
};


var ConfirmedReportSchema = new Schema(confirmedReportModel);
var confirmedReport = mongoose.model('ConfirmedReport', ConfirmedReportSchema);

exports.confirmedReport = confirmedReport;

var confirmedReportValidation = {
	properties: {
		created_date: {
			description: 'Date this reporter was created in datastore',
			type: 'date',
			default: 'Date.now'
		},
		updated_date: {
			description: 'Date this reporter was updated in datastore',
			type: 'date',
			default: 'Date.now'
		},
		alpha_report_id: {
			description: 'alpha_report from which this confirmed report was derived',
			type: 'objectId',
			required: true
		},
		target_event_id: {
			description: 'target_event that was considered a match',
			type: 'objectId'
		},
		target_event_percentage: {
			description: 'percentage match to target event (value between 0.0 and 1. 0)',
			type: 'number',
			default: 1.0,
			minimum: 0,
			maximum: 1.0,
			messages: {
				minimum: 'Expected number to be >= 0',
				maximum: 'Expected number to be <= 1.0'
			}
		},
		profile_id: {
			description: 'person confirming the report',
			type: 'objectId'
		},
		confirmed_date: {
			description: 'date the report was confirmed (or re-confirmed)',
			type: 'date'
		},
		assertions: {
			description: '_id list of the assertions that were used as basis for this confirmed_report',
			type: 'objectId'
		}
	}
};