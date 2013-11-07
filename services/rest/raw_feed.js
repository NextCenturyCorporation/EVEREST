var RawFeedService = require('../database/raw_feed.js');
var responseHandler = require('../general_response');

module.exports = function(app, models, io, logger) {

	var rawFeedService = new RawFeedService(models, io, logger);

	// Get a list of all rawFeeds
	app.get('/rawfeed/?', function(req, res){
		if (logger.DO_LOG){ 
			logger.info('Request for list of feeds');
		}

		//params
		rawFeedService.list(req.query, function(err, rawFeeds, config){
			if(err){
				var errMsg = "Error listing raw feeds";
				logger.error("RawFeed: "+err, err);
				responseHandler.send500(res, errMsg);
			} else {
				rawFeedService.getTotalCount(config, function(err, numFeeds){
					if (err){
						logger.error("RawFeed: "+err, err);
						responseHandler.send500(res, "Error getting count of raw feeds");
					} else {
						res.jsonp({docs: rawFeeds, total_count: numFeeds});
						res.end();
					}
				});
			}
		});
	});
	
	app.get('/rawfeed/indexes', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for list of indexes');
		}
		
		rawFeedService.getIndexes(function(indexes){
			if (!indexes){
				responseHandler.send500(res, "Error getting indexes of Raw Feeds");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});

	app.get('/rawfeed/dates', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for list of dates');
		}
		
		rawFeedService.findDates(function(dates){
			if (!dates){
				responseHandler.send500(res, "Error getting dates of raw feeds");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	// Review
	app.get('/rawfeed/:id([0-9a-f]+)', function(req, res){
		if(0 && logger.DO_LOG){
			logger.info("Request for raw feed " + req.params.id);
		}
		rawFeedService.get(req.params.id, function(err, docs){
			if(err) {
				logger.info("Error getting raw feed "+err);
				responseHandler.send500(res, "Error getting raw feed " + err);
			} else if(docs) {
				res.jsonp(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	// Create
	app.post('/rawfeed/?', function(req, res){
		if(logger.DO_LOG){
			logger.info("Receiving new feed", req.body);
		}
		rawFeedService.create(req.body, function(err, val, newFeed) {
			if(err){
				logger.error('Error saving raw feed ', err);
				responseHandler.send500(res, 'Error saving raw feed ' + err);
			} else if (!val.valid) {
				logger.info('Invalid raw_feed ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid raw feed ' + JSON.stringify(val.errors));
			} else {
				logger.info('Raw feed saved ' + JSON.stringify(newFeed));
				res.json({_id:newFeed._id});
				res.end();
			}
		});
	});

	// Update
	app.post('/rawfeed/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update feed " + req.params.id, req.body);
		}
		rawFeedService.update(req.params.id, req.body, function(err, val, updFeed) {
			if(err){
				logger.error('Error updating raw feed', err);
				responseHandler.send500(res, 'Error updating raw feed ' + err);
			} else if (!val.valid) {
				logger.info('Invalid raw feed ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid raw feed ' + JSON.stringify(val.errors));
			} else {
				logger.info('Raw feed updated ' + JSON.stringify(updFeed));
				res.json({id:updFeed._id});
				res.end();
			}
		});
	});

	// Delete an individual raw_feed
	app.del('/rawfeed/:id([0-9a-f]+)',function(req, res){
		var id = req.params.id;

		if(logger.DO_LOG){
			logger.info("Deleting raw feed with id: " + id);
		}

		rawFeedService.del({_id:id}, function(err, count){
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	// Delete all raw_feed entries
	app.del('/rawfeed/',function(req, res){
		if(logger.DO_LOG){
			logger.info("Deleting all raw feed entries");
		}
		
		rawFeedService.del({}, function(err, count){
			res.json({deleted_count: count});
			res.end();
		});
	});
};