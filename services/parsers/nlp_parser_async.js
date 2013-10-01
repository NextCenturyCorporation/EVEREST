var java = require('java');
var async = require('async');
var actionEmitter = require('../action_emitter.js');

module.exports = function(models, io, logger) {
	var me = this;

	java.classpath.push('./java_lib/Triplet_Extraction.jar');
	
	var Parser = java.import('com.nextcentury.TripletExtraction.CoreNlpParser');
	var parser = new Parser();
	
	var PosTagger = java.import('com.nextcentury.TripletExtraction.CoreNlpPOSTagger');
	var posTagger = new PosTagger();

	var ArrayList = java.import('java.util.ArrayList');

	//var assertion_service = services.assertionService;
	
	/*me.parseAndSave = function(alpha_report_object){
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
							if(alpha_report_object._id) {
								assertion_object.alpha_report_id = alpha_report_object._id.toString();
							}
							if(alpha_report_object.reporter_id) {
								assertion_object.reporter_id = alpha_report_object.reporter_id.toString();
							}
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
			var errorMsg = new Error("Alpha Report Not valid");
			logger.error(errorMsg);
		}
	};*/
	me.parseAndSave = function(alpha_report_object) {
		logger.info('Attempting to parse alpha_report_object with id' + alpha_report_object._id);
		if(alpha_report_object.message_body) {
			
			parser.parseText(alpha_report_object.message_body, function(err, results) {
				var tuples = results;
				if(err) {
					logger.error("An error occurred while extracting triplets", err);
				}
				if(tuples.length === 0) {
					logger.error("No triplets were able to be extracted", err);
				} else {
					async.each(tuples, function(tuple, callback) {
						var assertion_object = {}

						if(alpha_report_object._id) {
								assertion_object.alpha_report_id = alpha_report_object._id.toString();
						}
						if(alpha_report_object.reporter_id) {
							assertion_object.reporter_id = alpha_report_object.reporter_id.toString();
						}
						assertion_object.entity1 = tuple.getEntity1StringSync().toString();
						assertion_object.relationship = tuple.getRelationStringSync().toString();
						assertion_object.entity2 = tuple.getEntity2StringSync().toString();
						
						actionEmitter.assertionBuiltEvent(assertion_object, callback);

						/*var assertion_object;
						if(alpha_report_object._id) {
								assertion_object.alpha_report_id = alpha_report_object._id.toString();
						}
						if(alpha_report_object.reporter_id) {
							assertion_object.reporter_id = alpha_report_object.reporter_id.toString();
						}
						assertion_object.entity1 = tuple.getEntity1StringSync().toString();
						assertion_object.relationship = tuple.getRelationStringSync().toString();
						assertion_object.entity2 = tuple.getEntity2StringSync().toString();
						assertion_service.saveAssertion(assertion_object, callback);*/
					});
				}
			});
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

		//FIXME handle errors appropriately
		var err = null;
		callback(err, tuples);
	};

	me.posTagSentences = function(sentence, callback) {
		posTagger.getTaggedSentence(sentencenl, function(err, taggedSentence) {
			if(err) {
				logger.error("An error occurred while trying to tag the sentence", err);
			}
			callback(err, taggedSentence);
		});
	}
};
