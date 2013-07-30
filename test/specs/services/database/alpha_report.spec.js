var base_path = '../../../..';
var services_path = base_path + '/services';

var alpha_report_service = require(services_path + '/database/alpha_report');
var models = require(base_path + '/models/models');
var general = require(services_path + '/wizard_service');
var config = require(base_path + '/config.js');

var winston = require('winston');
var logger = new (winston.Logger)({
	transports: [new (winston.transports.Console)({level:config.log_level}),
		new (winston.transports.File)({filename: base_path + '/logs/jasmine_testing.log'})]
});

describe('To test the alpha report service', function() {
	describe('listAlphaReports function', function() {
		it('verifies that the dependent functions are called if no error', function() {
			var callback = {};
			callback.json = function(docs) {
				logger.debug('alpha_report.listAlphaReports performed callback');
			};
			callback.end = function() {};

			spyOn(models.alphaReport, 'find').andCallFake(function(data, model_callback) {
				model_callback(undefined, ['a fake found item']);
			});

			spyOn(callback, 'json').andCallThrough();
			spyOn(callback, 'end').andCallThrough();

			alpha_report_service.listAlphaReports(callback);

			expect(models.alphaReport.find).toHaveBeenCalled();
			expect(callback.json).toHaveBeenCalled();
			expect(callback.end).toHaveBeenCalled();
		});

		it('verifies that dependent functions are called in if error state', function() {
			spyOn(models.alphaReport, 'find').andCallFake(function(data, model_callback) {
				model_callback("some error", []);
			});

			spyOn(general, 'send500').andCallFake(function(fake_res) {
				logger.debug('wizard_service.send500 call executed');
			});

			alpha_report_service.listAlphaReports({});

			expect(models.alphaReport.find).toHaveBeenCalled();
			expect(general.send500).toHaveBeenCalled();
		});
	});
});