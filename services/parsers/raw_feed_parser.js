var TwitterParser = require('./twitter_to_alpha_report.js');
var AtomRssParser = require('./atom_rss_to_alpha_report.js');
var RawFeedService = require('../database/raw_feed.js');

module.exports = function(models, io, logger, houston) {
	var me = this;

	var raw_feed_service = new RawFeedService(models, io, logger);
	var twitter_parser = new TwitterParser(models, io, logger, houston);
	var rss_atom_parser = new AtomRssParser(models, io, logger, houston);

	me.parsers = {
		"twitter": twitter_parser,
		"rss": rss_atom_parser
	};

	me.parseAndSave = function(id, callback) {
		logger.debug("Call to parse raw feed with id: " + id);
		raw_feed_service.get(id, function(err, docs) {

			if(err) {
				logger.error("There was an error finding the feed to parse");
				callback(err, null);
			} else {
				if(Object.keys(me.parsers).indexOf(docs[0].feedSource)) {
					if(docs[0].feedSource.toLowerCase() === "Twitter".toLowerCase()) {
						twitter_parser.parseAndSave(docs[0], callback);
					} else if(docs[0].feedSource.toLowerCase() === "RSS".toLowerCase()) {
						rss_atom_parser.parseAndSave(docs[0], callback);
					}
				} else {
					var msg = "Cannot find a parser for the raw feed type " + docs[0].feedSource;
					callback(msg, null);
				}
			}
		});
	};
};