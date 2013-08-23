var revalidator = require('revalidator');
var async = require('async');
var paramHandler = require('../list_default_handler');
var twitter = require('ntwitter');

var config = require('../../config.js');

var RawFeedService = require('./raw_feed.js');
var rawFeedParser = require('../parsers/raw_feed.js');

var twitterIngest = module.exports = function(models, io, logger) {
	var me = this;

	me.logger = logger;
	me.io = io;
	me.models = models;

	me.rawFeedService = new RawFeedService(models, io, logger);

	me.twitStreams = {};
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
		} else {
			me.create(config.defaultTwitterKey, function(err, twit) {
				if(err) {
					logger.error("Error adding default twitter key to known streams");
				} else {
					logger.debug("Added default twitter key to known streams");
				}
			});
		}
	});
};

twitterIngest.prototype.list = function(params, callback) {
	var me = this;
	paramHandler.handleDefaultParams(params, function(newParams) {
		//FIXME params
		me.models.twitterKey.find({}, function(err, feeds) {
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

twitterIngest.prototype.markActiveFeeds = function(feeds, callback) {
	var me = this;
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

twitterIngest.prototype.get = function(id, callback) {
	var me = this;
	me.models.twitterKey.find({_id: id}, callback);
};

twitterIngest.prototype.create = function(data, callback) {
	var me = this;

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

twitterIngest.prototype.startIngest = function(id, filters, callback) {
	var me = this;
	if(typeof(me.twitStreams[id]) !== 'undefined' && me.twitStreams[id]) {
		var stream = me.twitStreams[id];
		if(stream.activeStream) {
			callback(new Error('Stream is active, please stop before starting'));
		} else {
			stream.stream('statuses/filter', { track: filters }, function(newStream) {
				stream.activeStream = newStream;
				
				newStream.on('data', me.handleIncomingData);
				stream.on('end', function () {
					me.activeStream = null;
				});
				stream.on('destroy', function () {
					me.activeStream = null;
				});
			});
		}
	} else {
		var errMsg = "Cannot find known twitter stream for key with id " + id;
		callback(new Error(errMsg));
	}
};

twitterIngest.prototype.handleIncomingData = function(data) {
	var me = this;

	me.logger.debug("Saving feed item: " + data.user.screen_name + ": " + data.text);
	
	me.rawFeedService.saveFeed({feedSource: 'Twitter', text:JSON.stringify(data)}, function(err, valid, newfeed){
		if(err){
			me.logger.error('Error saving raw feed', err);
		} else if(!valid.valid) {
			me.logger.error('Validation error with ' + JSON.stringify(valid.errors));
		} else {
			me.logger.debug('Saved raw feed object ' + newfeed._id);
			me.callParser(newfeed._id);
		}
	});
};

twitterIngest.prototype.callParser = function(id) {
	var me = this;
	me.logger.debug("Parser to be called with id: " + id);
	process.nextTick(function() {
		rawFeedParser.parseAndSave(id);
	});
};

twitterIngest.prototype.stopIngest = function(id, callback) {
	var me = this;
	if(typeof(me.twitStreams[id]) !== 'undefined' && me.twitStreams[id]) {
		var stream = me.twitStreams[id];
		if(stream.activeStream) {
			stream.activeStream.destroy();
			stream.activeStream = null;
		}
		callback();
	} else {
		var errMsg = "Cannot find known twitter stream for key with id " + id;
		callback(new Error(errMsg));
	}
};

twitterIngest.prototype.del = function(config, callback) {
	var me = this;
	me.models.twitterKey.remove(config, callback);
};