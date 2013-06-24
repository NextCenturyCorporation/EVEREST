var raw_feed_service = require('../database/raw_feed.js');
var twitter = require('ntwitter');

var me = this;

var twit = null;
var logger = null;
var app = null;


this.load = function(napp, io, gcm, log) {
	twit = new twitter({
		consumer_key: 'rwJPisTyYT2zzi0o4hpv2g',
		consumer_secret: 'ncTw7IKtmCFwNyhQ8OOfshfGOOCPLPlDug0Em1oIg',
		access_token_key: '53703582-dF6S7rtSzCBQtxbQnSkjy49ECSPMix7tXz2O8W0ej',
		access_token_secret: 'G74GzFILLGmrjDV9cJSGQb6cRC4yk2sP5dD7lL8x2z0'
	});
	
	logger = log;
	app = napp;
	
	napp.get('/twitter-ingest', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for twitter ingest');
		}
		
		me.ingest(req.query, res);
	});
};

/**
 * Opens a stream and ingests twitter feed based on the provided filter params
 * 
 * @param String[] - array of filter strings
 * @param int - ms timeout after which to disconnect the stream
 */
me.ingest = function(query, res) {
	var time;
	if(query.time !== undefined && query.time !== null) {
		time = query.time;
	} else {
		time = 5000;
	}
	
	var filters = [];
	if(query.filters !== undefined && query.filters !== null) {
		filters = query.filters.split(',');
	}
	
	if(filters.length > 0) {
		twit.stream('statuses/filter', { track: filters }, function(stream) {
			stream.on('data', function (data) {
				logger.debug("Saving feed item: " + data.user.screen_name + ": " + data.text);
				
				raw_feed_service.saveFeed({text:data}, function(err, newfeed){
					if(err){
						logger.error('Error saving raw feed', err);
					} else {
						logger.debug('Saved raw feed object ' + newfeed._id);
					}
				});
			});
			
			setTimeout(function() {
				stream.destroy();
				logger.info("Stream closed; timeout reached");
			}, time);
		});
		
		logger.info("Spawned feed ingest on filter: '" + filters +"' to run for " + time + "ms");
		res.json({success:true, message:"Spawned Twitter feed ingest on filter: '" + filters +"' to run for " + time + "ms"});
		res.end();
	} else {
		logger.error("Filters were not specified; unable to ingest twitter feed");
		res.json({success:false, message:"Filters were not specified; unable to ingest twitter feed"});
		res.end();
	}
};

