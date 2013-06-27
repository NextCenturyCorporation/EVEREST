/*global require*/
// Identify require as a global function/keyword for JSHint

var rawFeedService = require('../database/raw_feed.js');
var rawFeedModel = require('../../models/location/model.js');
var revalidator = require('revalidator');

this.load = function(app, io, gcm, logger) {
	app.get('/rawfeed/?', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for list of feeds');
		}
		rawFeedService.listFeeds(req.query, res);
	});
	
	// Create
	app.post('/rawfeed/?', function(req, res){
		if(logger.DO_LOG){
			logger.info("Receiving new feed", req.body);
		}
		var validation = revalidator.validate(req.body, rawFeedValidation);
		if(validation.valid) {
			rawFeedService.createFeed(req.body, res, io, gcm);
		}
		else {
			if(logger.DO_LOG){
				logger.info(validation.errors);
			}
			res.status(500);
			res.json({error: validation.errors}, req.body);
		}
	});

	// Review
	app.get('/rawfeed/:id([0-9a-f]+)', function(req, res){
		if(0 && logger.DO_LOG){
			logger.info("Request for raw feed " + req.params.id);
		}
		rawFeedService.getFeed(req.params.id, req.query, res);
	});

	// Update
	app.post('/rawfeed/:id([0-9]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update feed " + req.params.id, req.body);
		}
		rawFeedService.updateFeed(req.params.id, req.body, res);
	});

	// Delete
	app.del('/rawfeed/:id([0-9a-f]+)',function(req, res){
		if(logger.DO_LOG){
			logger.info("Deleting location with id: " + req.params.id);
		}
		rawFeedService.deleteFeed(req.params.id, res);
	});
};
