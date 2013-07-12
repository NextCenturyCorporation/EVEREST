var twitter_parser = require('./twitter_to_alpha_report.js');
var raw_feed_service = require('../database/raw_feed.js');
var alpha_report_service = require('../database/alpha_report.js');
var logger = null;

var parsers = {
	"twitter": 
};

this.load = function(log) {
	logger = log;

	twitter_parser.load(log);
};

this.parseAndSave = function(id, callback) {
	logger.debug("Call to parse raw feed with id: " + id);

	raw_feed_service.getFeed(id, function(err, docs) {
		if(err) {
			logger.error("There was an error finding the feed to parse");
			callback(err, null);
		} else {
			var alpha_report = twitter_parser.parse(docs[0]);
			if(alpha_report.err) {
				log.error("There was an error parsing the raw_feed; " + alpha_report.err);
				callback(err, null);
			} else {
				alpha_report_service.saveAlphaReport(alpha_report, callback);
			}
		}
	});
};

