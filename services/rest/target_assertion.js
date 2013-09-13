var targetAssertionService = require('../database/target_assertion.js');

module.exports = function(app, models, io, logger) {
	
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;
	
	//list - lists full object
	app.get('/target_assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_assertion list");
		}
		targetAssertionService.listTargetAssertions(res);
	});
	
	//list - lists name and id
	app.get('/target_assertion/names/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_assertion name list");
		}
		targetAssertionService.listTargetAssertionNames(res);
	});

	//Create
	app.post('/target_assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new target_assertion");
		}
		targetAssertionService.createTargetAssertion(req.body, res);				
	});

	//review
	app.get('/target_assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_assertion "+req.params.id);
		}
		targetAssertionService.getTargetAssertion(req.params.id, res);
	});

	app.get('/target_assertion/:name', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for targetAssertionByName "+req.params.name);
		}
		targetAssertionService.getTargetAssertionByName(req.params.name, res);
	});

	// search
	app.search('/target_assertion/?', function(req,res){
		if (logger.DO_LOG){
			logger.info("Search for target_assertion "+JSON.stringify(req.body));
		}
		targetAssertionService.searchTargetAssertion(req.body, res);
	});
	
	//Update
	app.post('/target_assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update target_assertion "+req.params.id);
		}
		targetAssertionService.updateTargetAssertion(req.params.id, req.body, res);
	});
	
	//delete by id
	app.del('/target_assertion/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting target_assertion with id: " + req.params.id);
		}
		targetAssertionService.deleteTargetAssertion(req.params.id, req.body, res);
	});
	
	//delete all
	app.del('/target_assertion/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all target_assertions");
		}
		targetAssertionService.deleteTargetAssertions(res);
	});

};

