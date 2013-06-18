var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config.js');

this.userModel = {
	user_created: {type: Date, "default": Date.now},
	user_name: String
};
var UserSchema = new Schema(this.userModel);
this.user = mongoose.model('User', UserSchema);
