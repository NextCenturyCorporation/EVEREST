var targetEventService = require('../database/target_event.js');

module.exports = function(app, models, io, logger) {
	
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;
	
	//list - lists full object
	app.get('/target_event/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_event list");
		}
		targetEventService.listTargetEvents(res);
	});
	
	//list - lists name and id
	app.get('/target_event/names/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_event name list");
		}
		targetEventService.listTargetEventNames(res);
	});

	//Create
	app.post('/target_event/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new target_event");
		}
		targetEventService.createTargetEvent(req.body, res);				
	});

	//review
	app.get('/target_event/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_event "+req.params.id);
		}
		targetEventService.getTargetEvent(req.params.id, res);
	});

	app.get('/target_event/:name', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_event "+req.params.name);
		}
		targetEventService.getTargetEventByName(req.params.name, res);
	});

	// search
	app.search('/target_event/?', function(req,res){
		if (logger.DO_LOG){
			logger.info("Search for target_event "+JSON.stringify(req.body));
		}
		targetEventService.searchTargetEvent(req.body, res);
	});
	
	//Update
	app.post('/target_event/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update target_event "+req.params.id);
		}
		targetEventService.updateTargetEvent(req.params.id, req.body, res);
	});
	
	//delete by id
	app.del('/target_event/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting target_event with id: " + req.params.id);
		}
		targetEventService.deleteTargetEvent(req.params.id, req.body, res);
	});
	
	//delete all
	app.del('/target_event/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all target_event");
		}
		targetEventService.deleteTargetEvents(res);
	});

};

