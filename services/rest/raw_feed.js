var RawFeedService = require('../database/raw_feed.js');
var responseHandler = require('../wizard_service');

module.exports = function(app, models, io, logger) {
	
	var me = this;

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
				var errMsg = "Error listing raw feeds";
				me.logger.error("RawFeed: "+err, err);
				responseHandler.send500(res, errMsg);
			} else {
				res.json(rawFeeds);
			}
			res.end();
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

	// Create
	app.post('/rawfeed/?', function(req, res){
		var data = req.body;

		if(logger.DO_LOG){
			logger.info("Receiving new feed", data);
		}
		rawFeedService.create(req.body, function(err, val, newFeed) {
			if(err){
				logger.error('Error saving raw_feed ', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid raw_feed ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('Raw_feed saved ' + JSON.stringify(newFeed));
				res.json({id:newFeed._id});
			}
			res.end();
		});
	});

	// Update
	app.post('/rawfeed/:id([0-9a-f]+)', function(req,res){
		var data = req.body;

		if(logger.DO_LOG){
			logger.info("Update feed " + req.params.id, data);
		}
		rawFeedService.update(req.params.id, req.body, function(err, val, updFeed) {
			if(err){
				logger.error('Error updating raw_feed', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid raw_feed ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('Raw_feed updated ' + JSON.stringify(updFeed));
				res.json({id:updFeed._id});
			}
			res.end();
		});
	});

	// Delete an individual raw_feed
	app.del('/rawfeed/:id([0-9a-f]+)',function(req, res){
		var id = req.params.id;

		if(logger.DO_LOG){
			logger.info("Deleting raw feed with id: " + id);
		}

		rawFeedService.del({_id:id}, function(err){
			if(err){
				logger.error('Error deleting raw feed ' + id, err);
				res.status('500');
				res.json({error: 'Invalid raw feed ' + id});
				res.end();
			} else {
				res.json({status:'ok'});
				res.end();
			}
		});
	});
	
	// Delete all raw_feed entries
	app.del('/rawfeed/',function(req, res){
		if(logger.DO_LOG){
			logger.info("Deleting all raw feed entries");
		}
		
		rawFeedService.del({}, function(err){
			if(err){
				logger.error('Error deleting raw feeds', err);
				res.status('500');
				res.json({error: 'err'});
				res.end();
			} else {
				res.json({status:'ok'});
				res.end();
			}
		});
	});
};
