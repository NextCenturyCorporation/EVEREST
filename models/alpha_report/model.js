/*global require*/
// Identify require as a global function/keyword for JSHint

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
//var config = require('../../config.js');

this.alphaReportModel = {
	createdDate: {type: Date, default: Date.now},
	updatedDate: {type: Date, default: Date.now},
	raw_data_id: {type: ObjectId},
	source_name: {type: String, enum: ['Twitter', 'Email'], required: true},
	source_id: {type: String, required: true}, //FIXME   what is this?
	message_date: {type: Date},
	message_body: {type: String}, 
	reporter_id: {type: ObjectId},
	location_name: {type: String}, //FIXME   why is this here?
	longitude: {type: Number},
	latitude: {type: Number},
	radius: {type: Number},
	utc_offset: {type: Number},
	time_zone: {type: String},
	lang: {type: String}
};

var AlphaReportSchema = new Schema(this.alphaReportModel);
this.alphaReport = mongoose.model('AlphaReport', AlphaReportSchema);

this.alphaReportValidation = {
	properties:{
		createdDate: {
			description: 'Date that this alpha report was created in datastore',
			type: 'date'
		},
		updatedDate: {
			description: 'Date that this alpha report was last updated in datastore',
			type: 'date'
		},
		raw_data_id: {
			description : 'The id corresponding to the original raw data',
			type: 'string'
		},
		source_name: {
			description: "The alpha report's source name",
			type: 'string', 
			enum:['Twitter', 'Email'], 
			required: true
		},
		source_id: {
			description: "The alpha report's source id",
			type: 'string',
			required: true
		},
		message_date: {
			description: "The alpha report's date of message",
			type: 'date'
		},
		message_body: {
			description: "The message body of the alpha report",
			type: 'string'
		}, 
		reporter_id: {
			description: "The id of the reporter who created the message for this alpha report",
			type: 'string'
		},
		location_name: {
			description: "The location of the origin of the alpha report",
			type: 'string'
		},
		latitude: {
			description: 'Latitude value for the location of the alpha report',
			type: 'number',
			minimum: -90.0,
			maximum: 90.0,
			messages: {
				minimum: 'Expected number >= -90.0',
				maximum: 'Expected number <= 90.0'
			}
		},
		longitude: {
			description: 'Longitude value for the location of the alpha report',
			type: 'number',
			minimum: -180.0,
			maximum: 180.0,
			messages: {
				minimum: 'Expected number >= -180.0',
				maximum: 'Expected number <= 180.0'
			}
		},
		radius: {
			description: 'Radius in units of degrees',
			type: 'number',
			"default": 0,
			minimum: 0,
			messages: {
				minimum : 'Expected a non-negative radius, radius >= 0'
			}
		},
		utc_offset: {
			description: 'The difference in hours (including partial hours) from UTC',
			type: 'number',
			minimum: -12.0,
			maximum: 14.0,
			messages: {
				minimum: 'Expected UTC offset >= -12.0',
				maximum: 'Expected UTC offset <= 14.0'
			}
		},
		time_zone: {
			description: 'Time zone location of reporter',
			type: 'string'
		},
		lang: {
			description: 'The reporters native language',
			type: 'string'
		}
	}
};