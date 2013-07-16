var raw_feed_service = require('../database/raw_feed.js');
var raw_feed_parser = require('../parsers/raw_feed.js');
var twitter = require('ntwitter');

var me = this;

var twit = null;
var activeStream = null;
var logger = null;
var app = null;


this.load = function(napp, io, gcm, log) {
	raw_feed_parser.load(log);
	
	twit = new twitter({
		consumer_key: 'rwJPisTyYT2zzi0o4hpv2g',
		consumer_secret: 'ncTw7IKtmCFwNyhQ8OOfshfGOOCPLPlDug0Em1oIg',
		access_token_key: '53703582-dF6S7rtSzCBQtxbQnSkjy49ECSPMix7tXz2O8W0ej',
		access_token_secret: 'G74GzFILLGmrjDV9cJSGQb6cRC4yk2sP5dD7lL8x2z0'
	});
	
	logger = log;
	app = napp;
	
	napp.get('/twitter-ingest/start', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for twitter ingest start');
		}
		
		me.ingest(req.query, res);
	});
	
	napp.get('/twitter-ingest/stop', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for twitter ingest stop');
		}
		
		me.stopIngest(req.query, res);
	});
};

/**
 * Opens a stream and ingests twitter feed based on the provided filter params
 * 
 * @param String[] - array of filter strings
 * @param int - ms timeout after which to disconnect the stream
 */
me.ingest = function(query, res) {
	var time = null;
	if(query.time !== undefined && query.time !== null) {
		time = query.time;
	}
	
	var filters = [];
	if(query.filters !== undefined && query.filters !== null) {
		filters = query.filters.split(',');
	}
	
	if(filters.length > 0) {
		if(activeStream === null) {
			twit.stream('statuses/filter', { track: filters }, function(stream) {
				activeStream = stream;
				
				stream.on('data', function (data) {
					logger.debug("Saving feed item: " + data.user.screen_name + ": " + data.text);
					
					raw_feed_service.saveFeed({feedSource: 'Twitter', text:JSON.stringify(data)}, function(err, newfeed){
						if(err){
							logger.error('Error saving raw feed', err);
						} else {
							logger.debug('Saved raw feed object ' + newfeed._id);
							//me.callParser(newfeed._id);
						}
					});
				});
				
				if(time !== null) {
					setTimeout(function() {
						//stream.destroy();
						me.stopIngest();
						logger.info("Stream closed; timeout reached");
					}, time);
				}
			});
			
			logger.info("Spawned feed ingest on filter: '" + filters +"' to run " + (time === null ? "indefinitely" : "for " + time + "ms"));
			res.json({success:true, message:"Spawned Twitter feed ingest on filter: '" + filters +"' to run " + (time === null ? "indefinitely" : "for " + time + "ms")});
			res.end();
		} else {
			console.log("Active stream already set");
			//TODO return error json
		}
	} else {
		logger.error("Filters were not specified; unable to ingest twitter feed");
		res.json({success:false, message:"Filters were not specified; unable to ingest twitter feed"});
		res.end();
	}
};

me.callParser = function(id) {
	logger.debug("Parser to be called with id: " + id);
	process.nextTick(function() {
		raw_feed_parser.parse(id);
	});
};

me.stopIngest = function(query, res) {
	if(activeStream !== null) {
		logger.debug("Killing active stream");
		activeStream.destroy();
		activeStream = null;
		
		res.json({success:true, message:"Stopped twitter stream successfully"});
	} else {
		logger.debug("No active stream to kill");
		res.json({success:false, message:"No active twitter stream to stop"});
	}	
};

