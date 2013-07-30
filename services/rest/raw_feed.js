var rawFeedService = require('../database/raw_feed.js');

this.load = function(app, io, gcm, logger) {

	// Get a list of all rawFeeds
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
	
};
