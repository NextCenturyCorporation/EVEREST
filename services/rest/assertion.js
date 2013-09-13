var AssertionService = require('../database/assertion.js');

module.exports = function(app, models, io, logger) {
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;

	var assertionService = new AssertionService(models, io, logger);

	//list - lists full object
	app.get('/assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for assertion list");
		}
		assertionService.listAssertions(res);
	});
	
	//Create
	app.post('/assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new assertion");
		}
		assertionService.createAssertion(req.body, res);
	});


	//Review
	app.get('/assertion/:id([0-9a-f]+)', function(req,res){
		if(0 && logger.DO_LOG){
			logger.info("Request for assertion "+req.params.id);
		}
		assertionService.getAssertion(req.params.id, res);
	});
	
	//Update
	app.post('/assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update assertion "+req.params.id);
		}
		assertionService.updateAssertion(req.params.id, req.body, res);
	});
	
	//Delete and individual assertion
	app.del('/assertion/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting assertion with id: " + req.params.id);
		}
		assertionService.deleteAssertion(req.params.id, req.body, res);
	});

	//Delete all assertions
	app.del('/assertion/', function(req, res){
		if(logger.DO_LOG){
			logger.info("Deleting all assertion entries");
		}
		assertionService.deleteAssertions(res);
	});
};
