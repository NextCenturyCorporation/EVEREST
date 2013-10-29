var AssertionService = require('../database/assertion.js');
var responseHandler = require('../general_response');

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
		assertionService.list(req.query, function(err, docs, config){
			if(err){
				logger.info("Error listing assertions "+err);
				responseHandler.send500(res, "Error listing assertions");
			} else {
				assertionService.getTotalCount(config, function(err, numDocs){
					if (err){
						me.logger.error("Assertion: "+err, err);
						responseHandler.send500(res, "Error getting count of assertions");
					} else {
						res.jsonp({docs: docs, total_count: numDocs});
						res.end();
					}
				});
			}
		});
	});
	
	app.get('/assertion/indexes', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for list of indexes for assertion');
			
			assertionService.getIndexes(req.query, function(indexes){
				if (!indexes){
					responseHandler.send500(res, 'Error getting indexes of assertions');
				} else {
					res.jsonp(indexes);
					res.end();
				}
			});
		}
	});

	app.get('/assertion/dates', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for list of dates');
		}
		
		assertionService.findDates(function(dates){
			if (!dates){
				responseHandler.send500(res, "Error getting dates of raw feeds");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	//Create
	app.post('/assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new assertion");
		}

		var data = req.body;

		assertionService.create(data, function(err, val, newAssertion) {
			if(err){
				var msg = 'Error saving assertion';
				logger.error(msg, err);
				responseHandler.send500(res, msg);
			} else if (!val.valid) {
				logger.info('Invalid assertion ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
				res.end();
			} else {
				logger.info('Assertion saved ' + JSON.stringify(newAssertion));
				res.json({id:newAssertion._id});
				res.end();
			}
		});
	});


	//Review
	app.get('/assertion/:id([0-9a-f]+)', function(req,res){
		if(0 && logger.DO_LOG){
			logger.info("Request for assertion "+req.params.id);
		}
		assertionService.get(req.params.id, function(err, docs){
			if(err) {
				var msg = 'Error getting assertion';
				logger.error(msg, err);
				responseHandler.send500(res, msg);
			} else if(docs) {
				res.json(docs);
				res.end();
			} else {
				res.status(404);
				res.json({error: 'Not found'});
				res.end();
			}
		});
	});
	
	//Update
	app.post('/assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update assertion "+req.params.id);
		}
		
		var data = req.body;
		
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
	
	//Delete a single alpha report by the specified id
	app.del('/assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Deleting assertion with id: ' + req.params.id);
		}
		assertionService.del({_id: req.params.id}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	//Delete all reporters
	app.del('/assertion/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Deleting all assertion entries');
		}
		assertionService.del({}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
};
