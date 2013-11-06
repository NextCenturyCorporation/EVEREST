var PlaceService = require('../database/place.js');
var responseHandler = require('../general_response');

var place = module.exports = function(app, models, io, logger) {
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;
	
	var placeService = new PlaceService(models, io, logger);

	//list - lists full object
	app.get('/place/?', function(req, res){
		if (logger.DO_LOG) {
			logger.info("Request for place list");
		}
		
		placeService.list(req.query, function(err, docs, config){
			if (err) {
				logger.info('Error listing places ' + err);
				responseHandler.send500(res, 'Error listing places');
			} else {
				placeService.getTotalCount(config, function(err, numDocs){
					if (err) {
						logger.error('Place: ' + err, err);
						responseHandler.send500(res, 'Error getting total number of places');
					} else {
						res.jsonp({docs: docs, total_count: numDocs});
						res.end();
					}
				});
			}
		});
	});
	
	app.get('/place/indexes', function(req, res){
		if (logger.DO_LOG) {
			logger.info("Request for place list of indexes");
		}
		
		placeService.getIndexes(req.query, function(indexes){
			if (!indexes) {
				responseHandler.send500(res, "Error getting the indexes for place");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});
	
	app.get('/place/dates', function(req, res){
		if (logger.DO_LOG) {
			logger.info("Request for place list of dates");
		}
		
		placeService.findDates(function(dates){
			if (!dates) {
				responseHandler.send500(res, "Error getting the dates for place");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	//list - lists name and id
	app.get('/place/names/?', function(req,res){
		if (logger.DO_LOG) {
			logger.info("Request for place name list");
		}
		
		var params = {};
		placeService.listFields(params, "name", function(err, docs){
			if (err) {
				logger.info('Error listing place names ' + err);
				responseHandler.send500(res);
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});
	
	//review
	app.get('/place/:id([0-9a-f]+)', function(req,res){
		if (logger.DO_LOG) {
			logger.info("Request for place " + req.params.id);
		}
		
		placeService.get(req.params.id, function(err, docs){
			if (err) {
				logger.info('Error getting place ' + err);
				responseHandler.send500(res, 'Error getting place ' + err);
			} else if (docs){
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	//Create
	app.post('/place/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Receiving new place', req.body);
		}
		
		placeService.create(req.body, function(err, val, newPlace){
			if (err) {
				logger.error('Error saving place ', err);
				responseHandler.send500(res, 'Error saving place');
			} else if (!val.valid) {
				logger.info('Invalid Place ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid place');
			} else {
				logger.info('Place saved ' + JSON.stringify(newPlace));
				res.jsonp({_id: newPlace._id});
				res.end();
			}
		});				
	});

	app.get('/place/:name', function(req,res){
		if (logger.DO_LOG) {
			logger.info("Request for place with name "+req.params.name);
		}
		placeService.findWhere({name: req.params.name}, function(err, docs){
			if (err) {
				logger.error('Error listing place with name ' + req.params.name, err);
				responseHandler.send500(res);
			} else if (docs){
				res.jsonp(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	//Update
	app.post('/place/:id([0-9a-f]+)', function(req,res){
		if (logger.DO_LOG) {
			logger.info('Updating place with id ' + req.params.id);
		}
		
		placeService.update(req.params.id, req.body, function(err, val, updatedPlace){
			if (err) {
				logger.error('Error updating Place ', err);
				responseHandler.send500(res, 'Error updating Place');
			} else if (val && !val.valid) {
				logger.info('Invalid Place ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid Place');
			} else {
				res.jsonp({_id: updatedPlace._id});
				res.end();
			}
		});
	});
	
	//delete by id
	app.del('/place/:id([0-9a-f]+)', function(req, res) {
		if (logger.DO_LOG) {
			logger.info('Deleting place with id: ' + req.params.id);
		}
		
		placeService.del({_id: req.params.id}, function(err, count){
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	//delete all
	app.del('/place/', function(req, res) {
		if (logger.DO_LOG) {
			logger.info('Deleting all places');
		}
		
		placeService.del({}, function(err, count){
			res.json({deleted_count: count});
			res.end();
		});
	});
};