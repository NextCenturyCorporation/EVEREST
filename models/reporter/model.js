var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var ObjectId = Schema.ObjectId;

var reporterDataModel = {
	createdDate: {type: Date, "default": Date.now},
	updatedDate: {type: Date, "default": Date.now},
	name: {type: String, required: true},
	source_name: {type: String, enum:['Twitter', 'Email','RSS'], required: true},
	source_id: {type: String},
	screen_name: {type: String},
	place_name: {type: String},
	email: {type: String},
	phone: {type: String},
	ip: {type: String},
	url: {type: String},
	description: {type: String},
	utc_offset: {type: Number},
	time_zone: {type: String},
	lang: {type: String}
};

var ReporterSchema = new Schema(reporterDataModel);
var reporter = mongoose.model('reporter', ReporterSchema);

var reporterValidation = {
	properties: {
		createdDate: {
			description: 'Date this reporter was created in datastore',
			type: 'object'
		},
		updatedDate: {
			description: 'Date this reporter was last updated in datastore',
			type: 'object'
		},
		name: {
			description : 'The name of the reporter',
			type: 'string',
			required: true
		},
		source_name: {
			description: 'The reporters source name',
			type: 'string',
			enum:['Twitter', 'Email','RSS'],
			required: true
		},
		source_id: {
			description: 'The reporters source id',
			type: 'string'
		},
		screen_name: {
			description: 'The reporters screen name',					//no spaces?
			type: 'string'
		},
		place_name: {
			description: 'Where the reporter is located',
			type: 'string'
		},
		email: {
			description: 'The reporters e-Mail address',
			type: 'string',
			format: 'email'
		},
		phone: {
			description: 'The reporters phone number',
			type: 'string',
			pattern: /([0-9]{10})|(([0-9]{3}[\/-]{0,1}|\([0-9]{3}\))[0-9]{3}-{0,1}[0-9]{4})/
		},
		ip: {
			description: 'The IP address of the reporter',
			type: 'string',
			format: 'ip-address'
		},
		url: {
			description: 'The url of the object should be stored at',
			type: 'string',
			format: 'url'
		},
		description: {
			description: 'Description of the reporter',
			type: 'string'
		},
		utc_offset: {
			description: 'The difference in seconds (including partial hours) from UTC',
			type: 'number',
			minimum: -43200,
			maximum: 50400.0,
			messages: {
				minimum: 'Expected UTC offset >= -43200.0',		//reported technically as hours 09:30 12:00 ish stuff
				maximum: 'Expected UTC offset <= 50400.0'
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

exports.reporter = reporter;
exports.reporterValidation = reporterValidation;