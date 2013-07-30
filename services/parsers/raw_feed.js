var twitter_parser = require('./twitter_to_alpha_report.js');
var raw_feed_service = require('../database/raw_feed.js');
var logger = null;

var parsers = {
	"twitter": twitter_parser
};

var load = function(log) {
	logger = log;

	twitter_parser.load(log);
};

var parseAndSave = function(id, callback) {
	logger.debug("Call to parse raw feed with id: " + id);

	raw_feed_service.getFeed(id, function(err, docs) {
		if(err) {
			logger.error("There was an error finding the feed to parse");
			callback(err, null);
		} else {
			logger.debug("Parser - Docs found: " + docs);
			if(Object.keys(parsers).indexOf(docs.feedSource)) {
				twitter_parser.parseAndSave(docs, callback);
			} else {
				var msg = "Cannot find a parser for the raw feed type " + docs[0].feedSource;
				callback(msg, null);
			}
		}
	});
};

exports.known_parsers = parsers;
exports.load = load;
exports.parseAndSave = parseAndSave;