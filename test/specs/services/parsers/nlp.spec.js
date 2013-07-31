var base_path = '../../../..';
var services_path = base_path + '/services';

var nlp_parser = require(services_path + '/parsers/nlp_parser.js'); 
var alpha_report_service = require(services_path + '/database/alpha_report.js');
var assertion_service = require(services_path + '/database/assertion.js');
var config = require(base_path + '/config.js');

var winston = require('winston');
var logger = new (winston.Logger)({
	transports: [new (winston.transports.Console)({level:config.log_level}),
		new (winston.transports.File)({filename: base_path + '/logs/jasmine_testing.log'})]
});


var java = require('java');
java.classpath.push(base_path +'/Triplet_Extraction.jar');
var Parser = java.import('com.nextcentury.TripletExtraction.CoreNlpParser');
var parser = new Parser(), extractor = null;

describe('To verify the the nlp parsers ', function() {
	it('ability to run', function(){
		var ar_object = {
			"_id":"51f80c293cc187ca150000d1",
			"reporter_id":"51f80c293cc187ca150000d0",
			"source_name":"Twitter", 
			"source_id":"5", 
			"message_body":"A rare black squirrel has become a regular visitor to a suburban garden. And he ate bunnies."
		}
		
		var tree = parser.parseSync(ar_object.message_body);
		
		spyOn(logger, 'info').andCallThrough();
		spyOn(assertion_service, 'saveAssertion').andCallThrough();
		
		nlp_parser.load(logger);
		nlp_parser.parseAndSave(ar_object);
		
		expect(logger.info).toHaveBeenCalled();
		expect(assertion_service.saveAssertion).toHaveBeenCalled();
	});
	
	it('ability to not call save when message_body won\'t yield a triplet', function(){
		var ar_object = {
			"_id":"51f80c293cc187ca150000d1",
			"reporter_id":"51f80c293cc187ca150000d0",
			"source_name":"Twitter", 
			"source_id":"5", 
			"message_body":"Hi"
		}

		spyOn(assertion_service, 'saveAssertion').andCallThrough();
		
		nlp_parser.load(logger);
		nlp_parser.parseAndSave(ar_object);
		
		expect(assertion_service.saveAssertion).not.toHaveBeenCalled();
	});
	
	it('ability to extract multiple assertions from a single message_body', function(){
		var ar_object = {
			"_id":"51f80c293cc187ca150000d1",
			"reporter_id":"51f80c293cc187ca150000d0",
			"source_name":"Twitter", 
			"source_id":"5", 
			"message_body":"A rare black squirrel has become a regular visitor to a suburban garden. A rare black squirrel has become a regular visitor to a suburban garden."
		}
		
		var assert = spyOn(assertion_service, 'saveAssertion').andCallThrough();
		
		nlp_parser.load(logger);
		nlp_parser.parseAndSave(ar_object);
		
		expect(assert).toHaveBeenCalled();
		expect(assert.callCount).toEqual(2);
	});
	
});