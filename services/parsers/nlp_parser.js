var alpha_report_service = require('../database/alpha_report.js');
var assertion_service = require('../database/assertion.js');
var java = require('java');

java.classpath.push('./java_lib/Triplet_Extraction.jar');
var url = 'http://localhost:8081/';
var ExtractionService = java.import('com.nextcentury.TripletExtraction.ExtractionService');
var Parser = java.import('com.nextcentury.TripletExtraction.CoreNlpParser');
var parser = new Parser();
var extractor = new ExtractionService();
var logger = null;

this.load = function(log){
	logger = log;
};

this.parseAndSave = function(alpha_report_object, callback){
	logger.info('Attempting to parse alpha_report_object with id ' + alpha_report_object._id);
		
	var assertion_object = {};
	
	var tree = parser.parseSync(alpha_report_object.message_body);
	for (var i = 0; i < tree.sizeSync(); i++){
		//get first sentence fragment from parsed message
		var leaf = tree.getSync(i);
		var numKids = leaf.lastChildSync().numChildrenSync();
	
		//get rid of punctuation?
		var last = leaf.lastChildSync().lastChildSync().toStringSync();
		if (last.indexOf("(. ") === 0){
			leaf.lastChildSync().removeChildSync(numKids - 1);
		}
		var output = extractor.extractTripletSync(leaf);
		
		//create an assertion object for each section of this message body
		if (output){
			assertion_object.alpha_report_id = alpha_report_object._id.toString();
			assertion_object.reporter_id = alpha_report_object.reporter_id.toString();
			assertion_object.entity1 = output.getEntity1StringSync().toString();
			assertion_object.relationship = output.getRelationStringSync().toString();
			assertion_object.entity2 = output.getEntity2StringSync().toString();
			
			assertion_service.saveAssertion(assertion_object, function(err, valid, newAssertion){
				if (err){
					logger.info("There was an error saving the parsed Assertion object.");
				} else if(!valid.valid){
					logger.info("Invalid assertion " + JSON.stringify(valid.errors));
				} else {
					logger.info("Callback version " + newAssertion);
				}
			});
		}
	}
};

/**
 * callback signature  function(tuple object(s))
 */
var parseToTuples = function(textData, callback) {
	var tuples = [];

	logger.info(textData.text);
	
	var tree = parser.parseSync(textData.text);
	
	logger.info(tree.toString());
	
	for (var i = 0; i < tree.sizeSync(); i++){
		
		//get first sentence fragment from parsed message
		var leaf = tree.getSync(i);
		var numKids = leaf.lastChildSync().numChildrenSync();
	
		logger.info(leaf.toString());
		
		//get rid of punctuation?
		var last = leaf.lastChildSync().lastChildSync().toStringSync();
		if (last.indexOf("(. ") === 0){
			leaf.lastChildSync().removeChildSync(numKids - 1);
		}
		var output = extractor.extractTripletSync(leaf);

		if (output) {
			tuples.push({
					entity1: output.getEntity1StringSync().toString(),
					relationship: output.getRelationStringSync().toString(),
					entity2: output.getEntity2StringSync().toString()
			});
		}
	}
	callback(tuples);
};

exports.parseToTuples = parseToTuples;
