/*global require*/
// Identify require as a global function/keyword for JSHint

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config.js');

//Define basic first
this.commentDataModel = {
	text: {type: String, required:true},
	timestmp: {type: Date, "default": Date.now},
	date: Date,
	latitude: {type: Number, select: false},
	longitude: {type: Number, select: false}
};
var CommentSchema = new Schema(this.commentDataModel);
this.comment = mongoose.model('Comment', CommentSchema);