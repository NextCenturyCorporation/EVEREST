var AlphaReportService = require('../database/alpha_report.js');
var reporter_service = require('../database/reporter.js');
var AssertionService = require('../database/assertion.js');
var actionEmitter = require('../action_emitter.js');

String.prototype.stripHTMLFromFeed = function() {
  return this.replace(/(<([^>]+)>)/ig, '').replace(/\&.+\;/ig, '').replace(/(\r\n|\n|\r)/gm,'').trim();
};


module.exports = function(models, io, logger) {
	var self = this;

	var alphaReportService = new AlphaReportService(models, io, logger);
	
	self.parseAndSave = function(raw_feed_object) {
		var alpha_report_object = {};

		alpha_report_object.raw_data_id = raw_feed_object._id;
		alpha_report_object.source_name = raw_feed_object.feedSource;

		var parsed_text = JSON.parse(raw_feed_object.text);
		var feedId = parsed_text.guid || parsed_text.id || '';
		var parsedDate = parsed_text.pubDate || parsed_text.published ||parsed_text.meta.date || '';
		var language = parsed_text.language || parsed_text.meta.language;
		var author = parsed_text.author || parsed_text.meta.author;
		var feedContent = parsed_text.description || parsed_text.content || parsed_text.summary;
		alpha_report_object.source_id = feedId;
		alpha_report_object.message_date = parsedDate;
		if(feedContent) {
			var content = feedContent.stripHTMLFromFeed();
			//This makes an attempt to clean up some of the extra things reuters likes to 
			//add into their content body.
			if(feedId.indexOf('reuters') > 0) {
				content = content.substring(content.indexOf('-') + 2, content.length).trim();
				content = content.replace('...', '');
			}
			alpha_report_object.message_body = content;
		}
		if(language && typeof language == 'string') {
			alpha_report_object.lang = language;
		}
		if(author) {
			var reporter_object = {};
			var url = parsed_text.link || parsed_text.origlink;
			reporter_object.name = author;
			reporter_object.source_name = raw_feed_object.feedSource;
			reporter_object.source_id = parsed_text.feedId;
			if(url) {
				reporter_object.url = url;
			}
			if(language && typeof language == 'string') {
				reporter_object.lang = language;
			}
			reporter_service.saveReporter(reporter_object, function(err, valid, newReporter) {
				if(err) {
					logger.error(err);
				} else if (!valid.valid) {
					logger.info('Invalid Reporter ' + JSON.stringify(valid.errors));
				} else {
					alpha_report_object.reporter_id = newReporter._id;
					alphaReportService.create(alpha_report_object, createAlphaReportCallback);
				}
			});

		} else {
			alphaReportService.create(alpha_report_object, createAlphaReportCallback);
		}
	};


	var createAlphaReportCallback = function(err, valid, res) {
		if (err) {
			logger.debug(res);
		} else if (!valid.valid) {
			logger.info('Invalid alpha_report ' + JSON.stringify(valid.errors));
		} else {
			process.nextTick(function() {
				actionEmitter.saveAlphaReportEvent(res);
			});
		}
	};
};