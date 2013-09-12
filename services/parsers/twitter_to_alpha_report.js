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
		logger.debug("Attempting to parse raw_feed_object with id " + raw_feed_object._id);

		var alpha_report_object = {};

		alpha_report_object.raw_data_id = raw_feed_object._id;
		alpha_report_object.source_name = raw_feed_object.feedSource;

		var object_text = raw_feed_object.text;
		var parsed_text = JSON.parse(object_text);

		alpha_report_object.source_id = parsed_text.id_str;
		var parsedDate = me.parseTwitterDate(parsed_text.created_at);
		alpha_report_object.message_date = parsedDate;
		alpha_report_object.message_body = parsed_text.text;
		if(parsed_text.user.utc_offset) {
			alpha_report_object.utc_offset = parsed_text.user.utc_offset;
		}
		if(parsed_text.user.time_zone) {
			alpha_report_object.time_zone = parsed_text.user.time_zone;
		}
		alpha_report_object.lang = parsed_text.lang;


		//create reporter object from parsed data
		var reporter_object = {};
		reporter_object.name = parsed_text.user.name;
		reporter_object.source_name = raw_feed_object.feedSource;
		reporter_object.source_id = parsed_text.user.id_str;
		reporter_object.screen_name = parsed_text.user.screen_name;
		reporter_object.location_name = parsed_text.user.location;
		//reporter_object.email = parsed_text.user.
		//reporter_object.phone = parsed_text.user.
		//reporter_object.ip = parsed_text.user.
		if(parsed_text.user.url) {
			reporter_object.url = parsed_text.user.url;
		}
		if(parsed_text.user.description) {
			reporter_object.description = parsed_text.user.description;
		}
		if(parsed_text.user.time_zone) {
			reporter_object.utc_offset = parsed_text.user.utc_offset;
		}
		if(parsed_text.user.time_zone) {
			reporter_object.time_zone = parsed_text.user.time_zone;
		}
		reporter_object.lang = parsed_text.user.lang;
		//need to figure out geo
		if(parsed_text.coordinates !== undefined && parsed_text.coordinates !== null) {
			alpha_report_object.longitude = parsed_text.coordinates.coordinates[0];
			alpha_report_object.latitude = parsed_text.coordinates.coordinates[1];
		}
		alpha_report_object.radius = 0;


		// TODO  Need to figure out what the callback is for parseAndSave and call it
		
		reporter_service.saveReporter(reporter_object, function(err, valid, newReporter) {
			if(err) {
				//var msg = "There was an error saving off a parsed Reporter object";
				//me.callback(msg, null);
				logger.error(err);
			} else if (!valid.valid) {
				logger.info("Invalid Reporter " + JSON.stringify(valid.errors));
			} else {
				alpha_report_object.reporter_id = newReporter._id;
				alphaReportService.create(alpha_report_object, function(err, valid, res) {
					if (err) {
						//me.callback(err, res);
						logger.debug(res);

					} else if (!valid.valid) {
						logger.info('Invalid alpha_report ' + JSON.stringify(valid.errors));
					} else {
						process.nextTick(function() {
							nlp_parser.parseAndSave(res);
						});
					}
				});
			}
		});
	};
};
