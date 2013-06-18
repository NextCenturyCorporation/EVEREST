var rawFeedService = require('../database/raw_feed.js');

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
		rawFeedService.createFeed(req.body, res, io, gcm);
	});

	// Review
	app.get('/rawfeed/:id([0-9a-f]+)', function(req, res){
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
			logger.info("Request to delete feed");
		}
		rawFeedService.deleteFeed(req.params.id, res);
	});
};
