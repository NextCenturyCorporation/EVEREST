var base_path = '../../../..';
var services_path = base_path + '/services';
var models = require(base_path + '/models/models');
var java = require('java');
java.classpath.push(base_path +'/java_lib/Triplet_Extraction.jar');
var Nlp_Parser = require(services_path + '/parsers/nlp_parser_async.js'); 
var alpha_report_service = require(services_path + '/database/alpha_report.js');
var Assertion_Service = require(services_path + '/database/assertion.js');
var config = require(base_path + '/config.js');

var winston = require('winston');
var logger = new (winston.Logger)({
	transports: [new (winston.transports.Console)({level:config.log_level}),
		new (winston.transports.File)({filename: base_path + '/logs/jasmine_testing.log'})]
});
var assertionService = new Assertion_Service(models, null, logger);
var nlpParser = new Nlp_Parser({assertionService: assertionService}, logger);



		
describe('To verify the the nlp parsers ', function() {
	it('ability to run', function(){
		var ar_object = {
			"_id":"51f80c293cc187ca150000d1",
			"reporter_id":"51f80c293cc187ca150000d0",
			"source_name":"Twitter", 
			"source_id":"5", 
			"message_body":"A rare black squirrel has become a regular visitor to a suburban garden. A rare black squirrel has become a regular visitor to a suburban garden."
		};
				
		spyOn(logger, 'info').andCallThrough();
		var assert = spyOn(assertionService, 'saveAssertion').andCallThrough();
		
		nlpParser.parseAndSave(ar_object);
		waits(1000);
		runs(function () {
			expect(logger.info).toHaveBeenCalled();
			expect(assert).toHaveBeenCalled();
			expect(assert.callCount).toEqual(2);
		});
	});
	
	it('ability to not call save when message_body won\'t yield a triplet', function(){
		var ar_object = {
			"_id":"51f80c293cc187ca150000d1",
			"reporter_id":"51f80c293cc187ca150000d0",
			"source_name":"Twitter", 
			"source_id":"5", 
			"message_body":"Hi"
		};

		spyOn(assertionService, 'saveAssertion').andCallThrough();
		
		nlpParser.parseAndSave(ar_object);
		
		expect(assertionService.saveAssertion).not.toHaveBeenCalled();
	});
	
});

describe('To check the functionality of the individual java calls coming in through node-java ', function(){

	it('checking the parser ', function(){
		var Parser = java.import('com.nextcentury.TripletExtraction.CoreNlpParser');
		var parser = new Parser();
		
		var tree = parser.parseSync("I never went to school when I was a kid");
		expect(tree.sizeSync()).toEqual(1);
	});
	
	it('checking the extraction service', function(){
		var Parser = java.import('com.nextcentury.TripletExtraction.CoreNlpParser');
		var parser = new Parser();
		var ExtractionService = java.import('com.nextcentury.TripletExtraction.ExtractionService');
		var extractor = new ExtractionService();
		
		var tree = parser.parseSync("A rare black squirrel has become a regular visitor to a suburban garden");
		var leaf = tree.getSync(0);
		
		var output = extractor.extractTripletSync(leaf);
		
		expect(output.getEntity1StringSync()).toEqual('squirrel');
		expect(output.getRelationStringSync()).toEqual('become');
		expect(output.getEntity2StringSync()).toEqual('visitor');
	});
});