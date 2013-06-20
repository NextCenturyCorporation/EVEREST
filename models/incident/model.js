/*global require*/
// Identify require as a global function/keyword for JSHint

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var config = require('../../config.js');

this.incidentModel = {
	timestmp: Date,
	event_ids: [ObjectId]
};
var IncidentSchema = new Schema(this.incidentModel);
this.incident = mongoose.model('Incident', IncidentSchema);
