var TwitterIngestService = require('../database/twitter_ingest');
var general = require('../wizard_service');
var async = require('async');

var twitterIngest = module.exports = function(app, models, io, logger) {
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;

	me.twitterIngestService = new TwitterIngestService(models, io, logger);

	//list
	me.app.get('/twitter-ingest/?', function(req, res) {
		me.twitterIngestService.list(req.query, function(err, keys) {
			if(err) {
				var errMsg = "There was an error getting list of feeds";
				logger.error("twitterIngest: " + errMsg, err);
				general.send500(res, errMsg);
			} else {
				returnArray = []
				async.each(keys, function(key, callback) {
					returnArray.push({
						consumer_key: key.consumer_key,
						consumer_secret: key.consumer_secret,
						access_token_key: key.access_token_key,
						access_token_secret: key.access_token_secret,
						_id: key._id,
						active: key.active,
						updatedDate: key.updatedDate,
						createdDate: key.createdDate
					});
					callback();
				}, function() {
					res.json(returnArray);
				});
			}
		});
	});

	//create
	me.app.post('/twitter-ingest/?', function(req, res) {
		//new feed
		var data = req.body;
		
		me.twitterIngestService.create(req.body, function(err, newKey) {
			if(err) {
				var errMsg = "There was an error creating feed";
				logger.error("twitterIngest: " + errMsg, err);
				general.send500(res, errMsg);
			} else {
				res.json(newKey);
			}
		});
		
	}); 

	//start
	me.app.post('/twitter-ingest/start/:id([0-9a-f]+)', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for twitter ingest start');
		}
		
		//FIXME filter out params
		//FIXMEme.startIngest(req.query, res);
	});
	
	//stop
	me.app.post('/twitter-ingest/stop/:id([0-9a-f]+)', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for twitter ingest stop');
		}
		
		//FIXME filter out params
		//FIXME me.stopIngest(req.query, res);
	});

	//delete one
	me.app.del('/twitter-ingest/:id([0-9a-f]+)', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for twitter feed delete');
		}
		
		me.twitterIngestService.del({_id: req.params.id}, function(err) {
			if(err) {
				var errMsg = "There was an error deleting feed";
				logger.error("twitterIngest: " + errMsg, err);
				general.send500(res, errMsg);
			} else {
				res.json({success: true});
			}
		});
	});

	//delete all
	me.app.del('/twitter-ingest/', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for all twitter feed delete');
		}
		
		me.twitterIngestService.del({}, function(err) {
			if(err) {
				var errMsg = "There was an error deleting feeds";
				logger.error("twitterIngest: " + errMsg, err);
				general.send500(res, errMsg);
			} else {
				res.json({success: true});
			}
		});
	});
};