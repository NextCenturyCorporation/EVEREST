var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var entity = new Schema({
	name: {type: String},
	value: {type: String, required: true},
	x: {type: Number},
	y: {type: Number},
	color: {type: String, trim:true}
});

var relationship = new Schema({
	name: {type: String},
	value: {type: String, required: true},
	color: {type: String, trim:true}
});

var targetAssertionModel = {
		createdBy: {type: Schema.Types.ObjectId},		// value supplied by the service of the profile creating the object
		updatedBy: {type: Schema.Types.ObjectId},		// value supplied by the service of the profile updating the object
		createdDate: {type: Date, "default": Date.now},	// value supplied by the service
		updatedDate: {type: Date, "default": Date.now},	// value supplied by the service
		name: {type: String, required: true},			// text identifier of the assertion
		description: {type: String},					// description of the assertion
		entity1: {type: [entity], required: true},
		relationship: {type: [relationship]},
		entity2: {type: [entity]}
};

var TargetAssertionSchema = new Schema(targetAssertionModel);
var targetAssertion = mongoose.model('TargetAssertion', TargetAssertionSchema);

//Describe the JSON semantic validation schema
var targetAssertionValidation = {
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
			description: 'Name of the assertion',
			type: 'string',
			required: true
		},
		description: {
			description: 'Description of the assertion',
			type: 'string'
		}
	}
};

exports.targetAssertion = targetAssertion;
exports.targetAssertionValidation = targetAssertionValidation;