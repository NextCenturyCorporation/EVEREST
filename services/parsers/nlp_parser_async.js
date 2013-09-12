var java = require('java');
var async = require('async');

module.exports = function(services, logger) {
	var me = this;

	java.classpath.push('./java_lib/Triplet_Extraction.jar');
	var ExtractionService = java.import('com.nextcentury.TripletExtraction.ExtractionService');
	var Parser = java.import('com.nextcentury.TripletExtraction.CoreNlpParser');
	var parser = new Parser();
	var extractor = new ExtractionService();
	var ArrayList = java.import('java.util.ArrayList');

	var assertion_service = services.assertionService;
	
	me.parseAndSave = function(alpha_report_object, saveCallback){
		logger.info('Attempting to parse alpha_report_object with id ' + alpha_report_object._id);		
		var assertion_object = {};
		if(alpha_report_object.message_body){
			parser.parseAndRemovePeriods(alpha_report_object.message_body, function(err, tree) {
				async.forEach(tree, function(leaf, callback) {
					extractor.extractTriplet(leaf, function (err, output) {
						if(err) {
							logger.error("Error occurred while extracting triplets", err);
							callback(err, output);
						} else if(output) {
							assertion_object.alpha_report_id = alpha_report_object._id.toString();
							assertion_object.reporter_id = alpha_report_object.reporter_id.toString();
							assertion_object.entity1 = output.getEntity1StringSync().toString();
							assertion_object.relationship = output.getRelationStringSync().toString();
							assertion_object.entity2 = output.getEntity2StringSync().toString();
							assertion_service.saveAssertion(assertion_object, callback);
						} else {
							logger.error("No Triplet was able to be extracted", err);
							callback(err, output);
						}
					});
				});
			});
		} else {
			logger.error("Alpha Report Not valid", err);
			saveCallback(err, alpha_report_object);
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
