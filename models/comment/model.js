/*global require*/
// Identify require as a global function/keyword for JSHint

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Define basic first
var commentDataModel = {
	text: {type: String, required:true},
	timestmp: {type: Date, "default": Date.now},
	date: {type: Date},
	latitude: {type: Number, select: false},
	longitude: {type: Number, select: false}
};

var CommentSchema = new Schema(commentDataModel);
var comment = mongoose.model('Comment', CommentSchema);

exports.comment = comment;