var base_path = '../../../..';
var services_path = base_path + '/services';

var raw_feed_parser = require(services_path + '/parsers/raw_feed_parser.js'); 
var twitter_parser = require(services_path + '/parsers/twitter_to_alpha_report.js');
var raw_feed_service = require(services_path + '/database/raw_feed.js');
var config = require(base_path + '/config.js');

var winston = require('winston');
var logger = new (winston.Logger)({
	transports: [new (winston.transports.Console)({level:config.log_level}),
		new (winston.transports.File)({filename: base_path + '/logs/jasmine_testing.log'})]
});

describe('To verify the the raw_feed parser', function() {
	describe('load function', function() {
		it('checks that the known parsers are initialized', function() {
			spyOn(twitter_parser, 'load').andCallThrough();

			raw_feed_parser.load(logger);

			expect(twitter_parser.load).toHaveBeenCalledWith(logger);
		});
	});
});