var eventing = require('../eventing/eventing');

var RawFeedService = require('../services/database/raw_feed');
var AssertionService = require('../services/database/assertion');

var RawFeedParser = require('../services/parsers/raw_feed_parser.js');
var ReportToTagsParser = require('../services/parsers/report_to_tags.js');
var AlphaReportToTagsParser = require('../services/parsers/alpha_report_to_tags.js');
var NlpParserAsync = require('../services/parsers/nlp_parser_async.js');

module.exports = function(models, io, logger) {
	var rawFeedService = new RawFeedService(models, io, logger);
	var assertionService = new AssertionService(models, io, logger);

	var rawFeedParser = new RawFeedParser(models, io, logger);
	var reportToTagsParser = new ReportToTagsParser(models, io, logger);
	var alphaReportToTagsParser = new AlphaReportToTagsParser(models, io, logger);
	var nlpParserAsync = new NlpParserAsync(models, io, logger);

	//raw-data-recieved -- checked
	eventing.on('raw-data-received', function(evt, data) {
		rawFeedService.create(data, function(err, valid, newFeed) {
			if(err){
				logger.error('Error saving raw feed', err);
			} else if(!valid.valid) {
				logger.error('Validation error with ' + JSON.stringify(valid.errors));
			} else {
				logger.debug('Saved raw feed object ' + newFeed._id);
			}
		});
	});

	//alpha-report-saved -- checked
	eventing.on('alpha-report-saved', function(evt, data) {
		alphaReportToTagsParser.addTags(data);
	});
	eventing.on('alpha-report-saved', function(evt, data) {
		nlpParserAsync.parseAndSave(data);
	});
	eventing.on('alpha-report-saved', function(evt, data) {
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'AlphaReport', eventObject: data});
		logger.debug('Emitted socket with item_saved for AlphaReport');
	});

	//assertion-saved -- checked
	eventing.on('assertion-saved', function(evt, data) {
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'Assertion', eventObject: data});
		logger.debug('Emitted socket with item_saved for Assertion');
	});

	//raw-feed-saved -- checked, choked on parsing non json
	eventing.on('raw-feed-saved', function(evt, data) {
		logger.debug("Parser to be called with id: " + data._id);
		rawFeedParser.parseAndSave(data._id, function(){
			logger.debug("Completed parsing raw feed");
		});
	});
	eventing.on('raw-feed-saved', function(evt, data) {
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'RawFeed', eventObject: data});
		logger.debug('Emitted socket with item_saved for RawFeed');
	});

	//report-saved
	eventing.on('report-saved', function(evt, data) {
		reportToTagsParser.addTags(data);
	});
	eventing.on('report-saved', function(evt, data) {
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'Report', eventObject: data});
		logger.debug('Emitted socket with item_saved for Report');
	});

	//assertion-built -- checked
	eventing.on('assertion-built', function(evt, data) {
		assertionService.create(data, function(err, valid, newAssertion) {
			if(err){
				logger.error('Error saving assertion', err);
			} else if(!valid.valid) {
				logger.error('Validation error with ' + JSON.stringify(valid.errors));
			} else {
				logger.debug('Saved assertion object ' + newAssertion._id);
			}
		});
	});
};