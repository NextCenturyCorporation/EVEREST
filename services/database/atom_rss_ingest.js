String.prototype.stripHTMLFromFeed = function() {
  return this.replace(/(<([^>]+)>)/ig, '').replace(/\&.+\;/ig, '');
};

String.prototype.tryToFixURI = function() {
	var indexWWW = this.indexOf('www');
	if(indexWWW === 0) {
		return 'http://' + this;
	} else if(indexWWW === -1 &&  this.indexOf('http') === -1) {
		return 'http://www.' + this;
	}
	return this.toString();
};

module.exports = function(models, io, logger) {
	var me = this;
	me.models = models;
	me.logger = logger;
	me.feed = {};
	me.feed.feedInterval = {};
	me.feed.links = {};
	var async = require('async');
	var eventing = require('../../eventing/eventing');
	var FeedParser = require('feedparser'),
		request = require('request');

	me.list = function(params, callback){
		me.findWhere({}, callback);
	};

	me.create = function(data, callback) {
		var newFeed = new me.models.atomRss(data);
		newFeed.save(function(err){
			if(err){
				logger.error('Error saving atomRss Feed ', err);
				callback(err, null);
			} else {
				me.logger.debug('Saved new feed with id ' + newFeed._id);
				if(newFeed.feed_active) {
					me.startIngestFeed(newFeed, callback);
				} else {
					callback(null, newFeed);
				}

			}
		});
	};

	me.get = function(id, callback){
		me.findWhere({_id: id}, callback);
	};

	me.startIngestFeed = function(feed, callback) {
		var intervalId = setInterval(function() {
			createReader(feed);
		}, feed.polling_interval);
		me.feed.feedInterval[feed._id] = intervalId;

		me.update(feed._id, {feed_active: true}, callback);
	};

	me.startIngest = function(id, callback) {
		me.get(id, function(err, feed) {
			var errorMsg = new Error('Could not find feed to start');
			if(err) {
				callback(errorMsg);
			} else if(feed[0]) {
				me.startIngestFeed(feed[0],callback);
			} else {
				callback(errorMsg);
			}
		});
	};


	me.stopIngest = function(id, callback) {
		if(me.feed.feedInterval[id]) {
			clearInterval(me.feed.feedInterval[id]);
			me.update(id, {feed_active:false}, callback);
		} else {
			var errorMsg = new Error('Could not find active feed to stop: ');
			callback(errorMsg, id);
		}
	};

	me.stopAllIngest = function(callback) {
		async.forEach(Object.keys(me.feed.feedInterval), function(i, callback) {
			me.stopIngest(i,callback);
		}, callback());
	};

	me.startAllIngest = function(callback) {
		me.list(null, function(err, feeds) {
			async.forEach(feeds, function(i, callback) {
				me.startIngest(i._id, callback);
			}, callback());
		});
	};

	me.initFeedStopped = function(callback) {
		me.list(null, function(err, feeds) {
			async.forEach(feeds, function(i, callback) {
				me.update(i._id, {feed_active:false},callback);
			}, callback());
		});
	};

	var createReader = function (feed) {
		if(feed && feed.feed_url) {
			request(feed.feed_url.tryToFixURI())
			.pipe(new FeedParser())
			.on('error', function (error) {
				logger.error(error);
			})
			.on('meta', function (meta) {
				logger.debug(meta);
				// console.log('===== %s =====', meta.title);
			})
			.on('readable', function() {
				//TODO: refactor.  Not certain that we want an assignment in the boolean check in the while statement
				//      Do not want to declare a function inside a loop.  Will create the function with each pass.

				var stream = this, item;
				while (null !== (item = stream.read())) {
					var link = item.link;
					if(link && !me.feed.links[link]) {
						me.feed.links[link] = link;
						eventing.fire('raw-data-received',{
							feedSource: 'RSS',
							text:JSON.stringify(item)
						});
					}
				}
			});
		}
	};

	me.update = function(id, data, callback) {
		me.models.atomRss.findById(id, function(err, feed) {
			if(err) {
				logger.error('Error updating atomRss Feed ', err);
				callback(err, null);
			} else if(feed){
				for(var item in data) {
					if(item !== '_id') {
						feed[item] = data[item];
					}
				}
				feed.updatedDate = new Date();
				feed.save(function(err) {
					if(err) {
						logger.error('Error saving updated atomRss Feed ', err);
						callback(err, null);
					} else {
						callback(err, feed);
					}
				});
			} else {
				var errorMesg = new Error('feed not found');
				logger.error('Feed not found ', err);
				callback(errorMesg, null);
			}
		});
	};

	me.findWhere = function(config, callback){
		me.models.atomRss.find(config, callback);
	};

	me.del = function(id, callback){
		me.stopIngest(id._id, function(err) {
			if(err) {
				logger.error("An error occurred", err);
			}
			me.feed.feedInterval[id._id] = null;
			me.models.atomRss.remove(id, callback);
		});
	};

	me.delAll = function(callback){
		me.stopAllIngest(function() {
			me.del({}, function() {
				me.feed = {};
				me.feed.feedInterval = {};
				me.feed.links = {};
				callback();
			});
		});
	};
};