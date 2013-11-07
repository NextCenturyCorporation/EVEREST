var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var assertionModel = {
	createdDate: {type: Date, "default": Date.now},
	updatedDate: {type: Date, "default": Date.now},
	alpha_report_id: {type: ObjectId, required: true},
	reporter_id: {type: ObjectId},
	entity1: {type: String, required: true},
	relationship: {type: String, required: true},
	entity2: {type: String, required: true}
};
var AssertionSchema = new Schema(assertionModel);
var assertion = mongoose.model('Assertion', AssertionSchema);

var assertionValidation= {
	properties: {
		createdDate: {
			description: 'Date this assertion was created in datastore',
			type: 'date'
		},
		updatedDate: {
			description: 'Date this assertion was last updated in datastore',
			type: 'date'
		},
		alpha_report_id: {
			description: 'ID of the corresponding alpha report',
			type: 'string',
			required: true
		},
		reporter_id: {
			description: 'ID of the reporter who submitted the alpha report',
			type: 'string',
		},
		entity1: {
			description: 'The subject of the raw feed',
			type: 'string',
			required: true
		},
		relationship: {
			description: 'The verb connecting the two entities',
			type: 'string',
			required: true
		},
		entity2: {
			description: 'The object of the raw feed',
			type: 'string',
			required: true
		}
	}
};

exports.assertion = assertion;
exports.assertionValidation = assertionValidation;
