var alpha_report_service = require('../database/alpha_report.js');
var assertion_service = require('../database/assertion.js');
var java = require('java');

java.classpath.push('./Triplet_Extraction.jar');
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
	console.log('Attempting to parse alpha_report_object with id ' + alpha_report_object._id);
	
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
			assertion_object.alpha_report_id = alpha_report_object._id;
			assertion_object.reporter_id = alpha_report_object.reporter_id;
			assertion_object.entity1 = output.getEntity1StringSync();
			assertion_object.relationship = output.getRelationStringSync();
			assertion_object.entity2 = output.getEntity2StringSync();
			
			assertion_service.saveAssertion(assertion_object, function(err, newAssertion){
				if (!err){
					console.log("Callback version " +newAssertion);
				} else {
					console.log("There was an error saving the parsed Assertion object.");
				}
			});
		}
	}
};

/*this.parseAndSave({
	"source_name":"Twitter",
	"source_id":"1",
	"message_body":"A rare black squirrel has become a regular visitor to a suburban garden",
	"_id":"51f18f098a77c28646000001",
	"__v":0,
	"updatedDate":"2013-07-25T20:48:09.388Z",
	"createdDate":"2013-07-25T20:48:09.388Z"
});*/

var obj = {
	"alpha_report_id":"51f286c9054604e60a000001",
	"entity1":"Francisco",
	"relationship":"is",
	"entity2":"excited"
};

assertion_service.saveAssertion(obj, function(err, newAssertion){
	if (!err){
		console.log("Callback version " +newAssertion);
	} else {
		console.log("There was an error saving the parsed Assertion object.");
	}
});