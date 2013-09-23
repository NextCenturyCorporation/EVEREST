var AtomRssIngestService = require('../database/atom_rss_ingest');
var general = require('../wizard_service');

var atomRssIngest = module.exports = function(app, models, io, logger) {
	var self = this;
	self.logger = logger;
	self.io = io;
	self.models = models;

	self.atomRssIngestService = new AtomRssIngestService(models, io, logger);

	//When the server is first started up no feeds should be active,
	//this is because we would not be able to track interval state.
	self.atomRssIngestService.initFeedStopped(function(err) {
		self.logger.debug("Not all feeds were initialized properly on startup");
	});

	/**
	* Lists all of atom/rss feeds that have been created.
	**/
	app.get('/atom-rss-ingest?', function(req, res) {
		self.atomRssIngestService.list(req.query, function(err, feeds) {
			var errMsg = "There was an error listing the feeds: " + req.query;
			handleResponse(err, res, errMsg, feeds);
		});
	});

	/**
	* Lists all of atom/rss feeds that have been created.
	**/
	app.get('/atom-rss-ingest/:id([0-9a-f]+)', function(req, res) {
		self.atomRssIngestService.get(req.params.id, function(err, feed) {
			var errMsg = "There was an error listing the feed: " + req.params.id;
			handleResponse(err, res, errMsg, feed);
		});
	});

	/**
	* Creates an rss/atom feed from the post data passed in.
	**/
	app.post('/atom-rss-ingest?', function(req, res) {
		self.atomRssIngestService.create(req.body, function(err, newFeed) {
			var errMsg = "There was an error creating the feed: " + req.body;
			handleResponse(err, res, errMsg, newFeed);
		});
	}); 

	/**
	* Updates an rss/atom feed from the post data passed in.
	**/
	app.post('/atom-rss-ingest/:id([0-9a-f]+)', function(req, res) {
		self.atomRssIngestService.update(req.params.id, req.body, function(err, updatedFeed) {
			var errMsg = "There was an error updating the feed: " + req.body;
			handleResponse(err, res, errMsg, updatedFeed);
		});
	});

	/**
	* Starts the given rss/atom feed based on the ID of the feed passed in 
	**/
	app.post('/atom-rss-ingest/start/:id([0-9a-f]+)', function(req, res){
		self.atomRssIngestService.startIngest(req.params.id, function(err) {
			var errMsg = "There was an error starting the feed: " + req.params.id;
			handleResponse(err, res, errMsg);
		});
	});

	/**
	* Starts all of the RSS feeds.
	**/
	app.post('/atom-rss-ingest/start?', function(req, res){
		self.atomRssIngestService.startAllIngest(function(err) { 
			var errMsg = "There was an error starting all of the feeds.";
			handleResponse(err, res, errMsg);
		});
	});
	
	/**
	* Stops the given rss/atom feed based on the ID of the feed passed in 
	**/
	app.post('/atom-rss-ingest/stop/:id([0-9a-f]+)', function(req, res){
		self.atomRssIngestService.stopIngest(req.params.id, function(err) {
			var errMsg = "There was an error stopping the feed: "+ req.params.id;
			handleResponse(err, res, errMsg);
		});
	});

	/**
	* Stops all of the RSS feeds.
	**/
	app.post('/atom-rss-ingest/stop?', function(req, res){
		self.atomRssIngestService.stopAllIngest(function(err) {
			var errMsg = "There was an error stopping all the feeds";
			handleResponse(err, res, errMsg);
		});
	});

	/**
	* Deletes the given rss/atom feed based on the ID of the feed passed in. 
	**/
	app.del('/atom-rss-ingest/:id([0-9a-f]+)', function(req, res){
		if(logger.DO_LOG){
			logger.info('Deleting rss/atom feed with the id: ' + req.params.id);
		}
		self.atomRssIngestService.del({_id: req.params.id}, function(err) {
			var errMsg = "There was an error deleting the feed" + req.params.id;
			handleResponse(err, res, errMsg);
		});
	});

	/**
	* Deletes all of the RSS feeds.
	**/
	app.del('/atom-rss-ingest/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Deleting all rss/atom feeds');
		}
		self.atomRssIngestService.delAll(function(err) {
			var errMsg = "There was an error deleting all the feeds";
			handleResponse(err, res, errMsg);
		});
	});

	var handleResponse = function (err, res, message, feed) {
		if(err) {
			logger.error("atomRssIngest: " + message, err);
			general.send500(res, message);
		} else if(feed && feed.length < 1) { //Checks for empty array from get.
			logger.error("atomRssIngest: " + message, err);
			general.send404(res);
		} else {
			var responseBack = {success:true};
			if(feed) {
				responseBack = feed;
			}
			res.jsonp(responseBack);
			res.end();
		}
	};

};