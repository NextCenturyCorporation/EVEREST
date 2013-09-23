String.prototype.stripHTMLFromFeed = function() {
  return this.replace(/(<([^>]+)>)/ig, '').replace(/\&.+\;/ig, '');
};

String.prototype.tryToFixURI = function() {
	var indexWWW = this.indexOf("www");
	if(indexWWW === 0) {
		return "http://" + this;
	} else if(indexWWW === -1 &&  this.indexOf("http") === -1) {
		return "http://www." + this;
	}
	return this.toString();
};
 
module.exports = function(models, io, logger) {
	var self = this;
	self.models = models;
	self.logger = logger;
	self.feed = {};
	self.feed.feedInterval = {};
	self.feed.links = {};
	var async = require('async');
	var actionEmitter = require('../action_emitter.js')
	var FeedParser = require('feedparser')
		  , request = require('request');

	self.list = function(params, callback){
		self.findWhere({}, callback);
	};

	self.create = function(data, callback) {
		var newFeed = new self.models.atomRss(data);
		newFeed.save(function(err){
			if(err){
				logger.error('Error saving atomRss Feed ', err);
				callback(err, null);
			} else {
				self.logger.debug("Saved new feed with id " + newFeed._id);
				if(newFeed.feed_active) {
					self.startIngestFeed(newFeed, callback);
				} else {
					callback();
				}
				
			}
		});
	};

	self.get = function(id, callback){
		self.findWhere({_id: id}, callback);
	};

	self.startIngestFeed = function(feed, callback) {
		var intervalId = setInterval(function() {
			createReader(feed);
		}, feed.polling_interval);
		self.feed.feedInterval[feed._id] = intervalId;

		self.update(feed._id, {feed_active: true}, callback);
	};

	self.startIngest = function(id, callback) {
		self.get(id, function(err, feed) { 
			if(err) {
				var errorMsg = new Error("Could not find feed to start");
				callback(errorMsg);
			} else if(feed[0]) {
				self.startIngestFeed(feed[0],callback);
			} else {
				var errorMsg = new Error("Could not find active feed to stop");
				callback(errorMsg);
			}
		});
	};


	self.stopIngest = function(id, callback) {
	 	if(self.feed.feedInterval[id]) {
			clearInterval(self.feed.feedInterval[id]);
			self.update(id, {feed_active:false}, callback);
	 	} else {
	 		var errorMsg = new Error("Could not find active feed to stop");
	 		callback(errorMsg,id);
	 	}
	};

	self.stopAllIngest = function(callback) {
		async.forEach(Object.keys(self.feed.feedInterval), function(i, callback) {
			self.stopIngest(i,callback);
		}, callback());
	};

	self.startAllIngest = function(callback) {
		self.list(null, function(err, feeds) {
			async.forEach(feeds, function(i, callback) {
				self.startIngest(i._id, callback);
			}, callback());
		});
	};

	self.initFeedStopped = function(callback) {
		self.list(null, function(err, feeds) {
			async.forEach(feeds, function(i, callback) {
				self.update(i._id, {feed_active:false},callback);
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
			 // console.log('===== %s =====', meta.title);
			})
			.on('readable', function() {
			  var stream = this, item;
			  while (item = stream.read()) {
			  	var link = item.link;
			  	if(link && !self.feed.links[link]) {
			  		self.feed.links[link] = link;
			  		var title = item.title || '';
				    var author = item.author || '';
				    var feedId = item.guid || item.id || '';
				    var feedContent = item.description || item.content || item.summary ||'';
				    var date = item.pubDate || item.published ||''; 
				    actionEmitter.twitterDataRecievedEvent({feedSource: 'RSS', text:JSON.stringify(item)}, function(err, valid, newfeed){
				    	actionEmitter.rawFeedParseEvent(newfeed._id)
			    	});
				}
			  }
			});
		}
		
	}

	self.update = function(id, data, callback) {
		self.models.atomRss.findById(id, function(err, feed) {
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

	self.findWhere = function(config, callback){
		self.models.atomRss.find(config, callback);
	};

	self.del = function(id, callback){
		self.stopIngest(id._id, function(err) {
			self.feed.feedInterval[id._id] = null;
			self.models.atomRss.remove(id, callback);
		});	
	};

	self.delAll = function(callback){
		self.stopAllIngest(function() {
			self.del({}, function() {
				self.feed = {};
				self.feed.feedInterval = {};
				self.feed.links = {};
				callback();
			});
		});
	};
};