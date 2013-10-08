var TwitterParser = require('./twitter_to_alpha_report.js');
var AtomRssParser = require('./atom_rss_to_alpha_report.js');
var RawFeedService = require('../database/raw_feed.js');

module.exports = function(models, io, logger) {
	var me = this;

	var raw_feed_service = new RawFeedService(models, io, logger);
	var twitter_parser = new TwitterParser(models, io, logger);
	var rss_atom_parser = new AtomRssParser(models, io, logger);

	me.parsers = {
		"twitter": twitter_parser,
		"rss": rss_atom_parser
	};

	me.parseAndSave = function(id, callback) {
		logger.debug("Call to parse raw feed with id: " + id);

		raw_feed_service.get({_id: id}, function(err, docs) {
			if(err) {
				logger.error("There was an error finding the feed to parse");
				callback(err, null);
			} else {
				if(Object.keys(me.parsers).indexOf(docs.feedSource)) {
					if(docs.feedSource.toLowerCase() === "Twitter".toLowerCase()) {
						twitter_parser.parseAndSave(docs, callback);
					} else if(docs.feedSource.toLowerCase() === "RSS".toLowerCase()) {
						rss_atom_parser.parseAndSave(docs, callback);
					}
				} else {
					var msg = "Cannot find a parser for the raw feed type " + docs[0].feedSource;
					callback(msg, null);
				}
			}
		});
	};
};