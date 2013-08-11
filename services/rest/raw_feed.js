var RawFeedService = require('../database/raw_feed.js');
var responseHandler = require('../wizard_service');

this.load = function(app, models, io, logger) {

	me.app = app;
	me.models = models;
	me.io = io;
	me.logger = logger;

	var rawFeedService = new RawFeedService(models, io, logger);

	// Get a list of all rawFeeds
	app.get('/rawfeed/?', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for list of feeds');
		}

		//params
		rawFeedService.list(req.query, function(err, rawFeeds){
			if(err){
				var errMsg = "Error listing raw feeds"
				me.logger.error("RawFeed: "+err, err);
				responseHandler.send500(res, errMsg);
			} else {
				res.json(rawFeeds);
			}
			res.end();
		});
	});
	
	/*
	// Create
	app.post('/rawfeed/?', function(req, res){
		if(logger.DO_LOG){
			logger.info("Receiving new feed", req.body);
		}
		rawFeedService.createFeed(req.body, res);
	});

	// Review
	app.get('/rawfeed/:id([0-9a-f]+)', function(req, res){
		if(0 && logger.DO_LOG){
			logger.info("Request for raw feed " + req.params.id);
		}
		rawFeedService.getFeedRequest(req.params.id, req.query, res);
	});

	// Update
	app.post('/rawfeed/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update feed " + req.params.id, req.body);
		}
		rawFeedService.updateFeed(req.params.id, req.body, res);
	});

	// Delete an individual raw_feed
	app.del('/rawfeed/:id([0-9a-f]+)',function(req, res){
		if(logger.DO_LOG){
			logger.info("Deleting raw feed with id: " + req.params.id);
		}
		rawFeedService.deleteFeed(req.params.id, req.body, res);
	});
	
	// Delete all raw_feed entries
	app.del('/rawfeed/',function(req, res){
		if(logger.DO_LOG){
			logger.info("Deleting all raw feed entries");
		}
		rawFeedService.deleteFeeds(res);
	});
	*/
};
