var TwitterParser = require('./twitter_to_alpha_report.js'); //TODO
var RawFeedService = require('../database/raw_feed.js');

module.exports = function(models, io, logger) {
	var me = this;

	var raw_feed_service = new RawFeedService(models, io, logger);
	var twitter_parser = new TwitterParser(models, io, logger);

	me.parsers = {
		"twitter": twitter_parser
	};

	me.parseAndSave = function(id, callback) {
		logger.debug("Call to parse raw feed with id: " + id);

		raw_feed_service.get(id, function(err, docs) {
			if(err) {
				logger.error("There was an error finding the feed to parse");
				callback(err, null);
			} else {
				logger.debug("Parser - Docs found: " + docs);
				if(Object.keys(me.parsers).indexOf(docs.feedSource)) {
					twitter_parser.parseAndSave(docs, callback);
				} else {
					var msg = "Cannot find a parser for the raw feed type " + docs[0].feedSource;
					callback(msg, null);
				}
			}
		});
	};
};