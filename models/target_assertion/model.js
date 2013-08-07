var mongoose = require('mongoose');
var Schema = mongoose.Schema;

this.entity = new Schema({
	name: {type: String},
	value: {type: String, required: true},
	x: {type: Number},
	y: {type: Number},
	color: {type: String, trim:true}	
});

this.relationship = new Schema({
	name: {type: String},
	value: {type: String, required: true},
	color: {type: String, trim:true},	
});

this.targetAssertionModel = {
		createdBy: {type: Schema.Types.ObjectId},		// value supplied by the service of the profile creating the object
		updatedBy: {type: Schema.Types.ObjectId},		// value supplied by the service of the profile updating the object
		createdDate: {type: Date},									// value supplied by the service
		updatedDate: {type: Date},									// value supplied by the service
		name: {type: String, required: true},				// text identifier of the assertion
		description: {type: String},								// description of the assertion
		entity1: {type: [this.entity], required: true},
		relationship: {type: [this.relationship]},
		entity2: {type: [this.entity]}
};

var TargetAssertionSchema = new Schema(this.targetAssertionModel);
this.targetAssertion = mongoose.model('TargetAssertion', TargetAssertionSchema);

//Describe the JSON semantic validation schema
this.targetAssertionValidation = {
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
