var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config.js');

this.locationDataModel = {
	name		:	{type: String, required:true},
	latitude	:	{type: Number, required:true},
	longitude	:	{type: Number, required: true},
	radius		:	{type: Number, required: true}
};

var LocationSchema = new Schema(this.locationDataModel);
this.location = mongoose.model('Location', LocationSchema);