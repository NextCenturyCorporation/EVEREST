//var incidentService = require('../database/incident.js');

module.exports = function(app, models, io, logger) {
	
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;


};