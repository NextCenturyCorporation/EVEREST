var java = require('java');

module.exports = function(services, logger) {
	var me = this;

	java.classpath.push('./java_lib/Triplet_Extraction.jar');
	var url = 'http://localhost:8081/';
	var ExtractionService = java.import('com.nextcentury.TripletExtraction.ExtractionService');
	var Parser = java.import('com.nextcentury.TripletExtraction.CoreNlpParser');
	var parser = new Parser();
	var extractor = new ExtractionService();

	var assertion_service = services.assertionService;
	
	me.parseAndSave = function(alpha_report_object, callback){
		logger.info('Attempting to parse alpha_report_object with id ' + alpha_report_object._id);
			
		var assertion_object = {};
		if(alpha_report_object.message_body){
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
					
					assertion_service.saveAssertion(assertion_object, saveAssertionCallback);

				}
			}
		}
	};

	var saveAssertionCallback = function(err, valid, newAssertion) {
		if (err){
			logger.info("There was an error saving the parsed Assertion object.");
		} else if(!valid.valid){
			logger.info("Invalid assertion " + JSON.stringify(valid.errors));
		} else {
			logger.info("Callback version " + newAssertion);
		}
	};

	/**
	 * callback signature  function(tuple object(s))
	 */
	me.parseToTuples = function(textData, callback) {
		var tuples = [];

		logger.info(textData.text);
		
		var tree = parser.parseSync(textData.text);
		
		var parsedTree = tree.toStringSync();

		tuples.push({
			original: textData.text,
			annotated: parsedTree
		});
		
		for (var i = 0; i < tree.sizeSync(); i++){
			
			//get first sentence fragment from parsed message
			var leaf = tree.getSync(i);
			var numKids = leaf.lastChildSync().numChildrenSync();
		
			var parsedLeaf = leaf.toStringSync();
			
			//get rid of punctuation?
			var last = leaf.lastChildSync().lastChildSync().toStringSync();
			if (last.indexOf("(. ") === 0){
				leaf.lastChildSync().removeChildSync(numKids - 1);
			}
			var output = extractor.extractTripletSync(leaf);

			if (output) {
				tuples.push({
					sentence: parsedLeaf,
					entity1: output.getEntity1StringSync().toString(),
					relationship : output.getRelationStringSync().toString(),
					entity2 : output.getEntity2StringSync().toString()
				});
			} else {
				tuples.push({
					sentence: parsedLeaf
				});
			}
		}
		callback(tuples);
	};
};
