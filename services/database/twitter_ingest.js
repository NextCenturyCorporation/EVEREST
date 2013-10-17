//var revalidator = require('revalidator');
var async = require('async');
var paramHandler = require('../list_default_handler');
var twitter = require('ntwitter');
var actionEmitter = require('../action_emitter.js');
var config = require('../../config.js');

module.exports = function(models, io, logger, createDefault) {
	var me = this;

	me.logger = logger;
	me.io = io;
	me.models = models;

	me.twitStreams = {};

	me.init = function(createDefaultKey) {
		me.list({}, function(err, feeds) {
			if(feeds.length > 0 ) {
				async.each(feeds, function(feed, eachCallback) {
					me.twitStreams[feed._id] = new twitter({
						consumer_key: feed.consumer_key,
						consumer_secret: feed.consumer_secret,
						access_token_key: feed.access_token_key,
						access_token_secret: feed.access_token_secret
					});
					me.twitStreams[feed._id].activeStream = null;
					eachCallback();
				});
			} else if(createDefaultKey){
				me.create(config.defaultTwitterKey, function(err) {
					if(err) {
						logger.error("Error adding default twitter key to known streams");
					} else {
						logger.debug("Added default twitter key to known streams");
					}
				});
			} else {
				me.init(createDefaultKey);
			}
		});
	};

	me.list = function(params, callback) {
		paramHandler.handleDefaultParams(params, function(/*newParams*/) {
			//FIXME params
			models.twitterKey.find({}, function(err, feeds) {
				if(err) {
					callback(err, feeds);
				} else {
					if(feeds.length > 0) {
						me.logger.debug("Found API Keys: " + feeds + "; designating active streams.");
					}
					me.markActiveFeeds(feeds, callback);
				}
			});
		});
	};

	me.markActiveFeeds = function(feeds, callback) {
		async.each(feeds, function(feed, eachCallback) {
			if(typeof(me.twitStreams[feed._id]) !== 'undefined' && me.twitStreams[feed._id]) {
				if(me.twitStreams[feed._id].activeStream) {
					feed.active = true;
				} else {
					feed.active = false;
				}
			}
			eachCallback();
		}, function(err) {
			callback(err, feeds);
		});
	};

	me.get = function(id, callback) {
		me.models.twitterKey.find({_id: id}, callback);
	};

	me.create = function(data, callback) {
		//FIXME validate
		var newFeed = new me.models.twitterKey(data);
		newFeed.save(function(err) {
			if(err) {
				me.logger.error('Error saving new feed', err);
				callback(err, null);
			} else {
				me.logger.debug("Saved new feed with id " + newFeed._id);

				var newStream = new twitter({
					consumer_key: newFeed.consumer_key,
					consumer_secret: newFeed.consumer_secret,
					access_token_key: newFeed.access_token_key,
					access_token_secret: newFeed.access_token_secret
				});
				
				me.twitStreams[newFeed._id] = newStream;

				callback(err, newFeed);
			}
		});
	};

	me.startIngest = function(id, filters, callback) {
		if(typeof(me.twitStreams[id]) !== 'undefined' && me.twitStreams[id]) {
			var stream = me.twitStreams[id];
			if(stream.activeStream) {
				callback(new Error('Stream is active, please stop before starting'));
			} else {
				stream.stream('statuses/filter', { track: filters }, function(newStream) {
					stream.activeStream = newStream;
					stream.activeStream.filters = filters;
					newStream.on('data', function(data) {
						me.logger.debug("Saving feed item: " + data.user.screen_name + ": " + data.text);
						
						actionEmitter.rawFeedDataRecievedEvent({feedSource: 'Twitter', text:JSON.stringify(data)}, function(err, valid, newfeed){
							if(err){
								me.logger.error('Error saving raw feed', err);
							} else if(!valid.valid) {
								me.logger.error('Validation error with ' + JSON.stringify(valid.errors));
							} else {
								me.logger.debug('Saved raw feed object ' + newfeed._id);
								me.callParser(newfeed._id);
							}
						});
					});
					newStream.on('end', function () {
						me.activeStream = null;
					});
					newStream.on('destroy', function () {
						me.activeStream = null;
					});
					newStream.on('error', function(response) {
						me.activeStream = null;
						logger.error("An error occured while streaming: ");
						logger.error(response);
						logger.error("The aciveStream has ended");
					});
				});

				callback();
			}
		} else {
			var errMsg = "Cannot find known twitter stream for key with id " + id;
			callback(new Error(errMsg));
		}
	};

	// me.handleIncomingData = function(data) {
	//	var me = this;
	
	//	me.logger.debug("Saving feed item: " + data.user.screen_name + ": " + data.text);
		
	//	me.rawFeedService.saveFeed({feedSource: 'Twitter', text:JSON.stringify(data)}, function(err, valid, newfeed){
	//		if(err){
	//			me.logger.error('Error saving raw feed', err);
	//		} else if(!valid.valid) {
	//			me.logger.error('Validation error with ' + JSON.stringify(valid.errors));
	//		} else {
	//			me.logger.debug('Saved raw feed object ' + newfeed._id);
	//			me.callParser(newfeed._id);
	//		}
	//	});
	// };

	me.callParser = function(id) {
		me.logger.debug("Parser to be called with id: " + id);
		process.nextTick(function() {
			actionEmitter.rawFeedParseEvent(id);
		});
	};

	me.stopIngest = function(id, callback) {
		if(typeof(me.twitStreams[id]) !== 'undefined' && me.twitStreams[id]) {
			var stream = me.twitStreams[id];
			if(stream.activeStream) {
				stream.activeStream.destroy();
				stream.activeStream = null;
				callback();
			} else {
				var errMsg = "Could not stop stream: " + id + ".  Stream is not currently active.";
				callback(new Error(errMsg));
			}
		} else {
			var errorMsg = "Cannot find known twitter stream for key with id " + id;
			callback(new Error(errorMsg));
		}
	};

	me.del = function(config, callback) {
		me.models.twitterKey.remove(config, callback);
	};

	me.init(createDefault);
};