var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var profileModel = {
		createdDate: {type: Date, "default": Date.now},
		updatedDate: {type: Date, "default": Date.now},
		name: {type: String, required:true},
		email: {type: String}
};
var ProfileSchema = new Schema(profileModel);
var profile = mongoose.model("Profile", ProfileSchema);

//Describe the JSON semantic validation schema
var profileValidation = {
	properties: {
		createdDate: {
			description: "Date this was created in datastore",
			type: "object"
		},
		updatedDate: {
			description: "Date this was last updated in datastore",
			type: "object"
		},
		name: {
			description: "Name of the person / profile",
			type: "string",
			required: true
		},
		email: {
			description: "email address",
			type: "string",
			format: "email"
		}
	}
};

exports.profile = profile;
exports.profileValidation = profileValidation;
