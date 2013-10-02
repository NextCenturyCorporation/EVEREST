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
		assertionService.list({}, function(err, docs){
			if(err){
				logger.info("Error listing assertions "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else {
				res.json(docs);
			}
			res.end();
		});
	});
	
	//Create
	app.post('/assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new assertion");
		}
		assertionService.create(req.body, function(err, val, newAssertion) {
			if(err){
				logger.error('Error saving assertion', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid assertion ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('Assertion saved ' + JSON.stringify(newAssertion));
				res.json({id:newAssertion._id});
			}
			res.end();
		});
	});


	//Review
	app.get('/assertion/:id([0-9a-f]+)', function(req,res){
		if(0 && logger.DO_LOG){
			logger.info("Request for assertion "+req.params.id);
		}
		assertionService.get(req.params.id, function(err, docs){
			if(err) {
				logger.info("Error getting assertion "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else if(docs) {
				res.json(docs);
			} else {
				res.status(404);
				res.json({error: 'Not found'});
			}
			res.end();
		});
	});
	
	//Update
	app.post('/assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update assertion "+req.params.id);
		}
		assertionService.update(req.params.id, req.body, function(err, val, updated) {
			if(err){
				logger.error('Error updating assertion', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid assertion ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('Assertion updated ' + JSON.stringify(updated));
				res.json({id:updated._id});
			}
			res.end();
		});
	});
	
	//Delete and individual assertion
	app.del('/assertion/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting assertion with id: " + req.params.id);
		}
		assertionService.del({_id: req.params.id}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});

	//Delete all assertions
	app.del('/assertion/', function(req, res){
		if(logger.DO_LOG){
			logger.info("Deleting all assertion entries");
		}
		assertionService.del({}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
};
