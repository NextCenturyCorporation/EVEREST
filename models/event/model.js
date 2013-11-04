/*global require*/
// Identify require as a global function/keyword for JSHint

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
//var config = require('../../config.js');

var eventModel = {
	timestmp: {type: Date, "default": Date.now},
	confirmed_report_ids: [ObjectId]
};
var EventSchema = new Schema(eventModel);
var eventObj = mongoose.model('Event', EventSchema);

var eventValidation = {};

exports.events = eventObj;
exports.eventsValidation = eventValidation;