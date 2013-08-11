/*global require*/
// Identify require as a global function/keyword for JSHint

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
//var config = require('../../config.js');

var incidentModel = {
	timestmp: Date,
	event_ids: [ObjectId]
};
var IncidentSchema = new Schema(incidentModel);
var incident = mongoose.model('Incident', IncidentSchema);

var incidentValidation = {};

exports.incident = incident;
exports.incidentValidation = incidentValidation;