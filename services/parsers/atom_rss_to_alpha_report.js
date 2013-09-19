var AlphaReportService = require('../database/alpha_report.js');
var reporter_service = require('../database/reporter.js');
var AssertionService = require('../database/assertion.js');
var Nlp_Parser = require('../parsers/nlp_parser_async.js');

module.exports = function(models, io, logger) {
	var me = this;

	var alphaReportService = new AlphaReportService(models, io, logger);
	var nlp_parser = new Nlp_Parser({assertionService: new AssertionService(models, io, logger)}, logger);

	me.parseTwitterDate = function(text) {
		return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
	};

	me.parseAndSave = function(raw_feed_object, callback) {
	}
};
