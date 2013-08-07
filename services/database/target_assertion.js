/**
 * Runs while connected to a database
 */
var winston = require('winston');
var models = require('../../models/models');
var validationModel = require('../../models/target_assertion/model.js');
var bvalidator = require('../../models/target_assertion/bvalidator.js');
var revalidator = require('revalidator');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * Returns a list of all the target_assertions
 */
var listTargetAssertions = function(res){
	models.targetAssertion.find({}, function(err, docs){
		if(err){
			logger.info("Error listing target_assertions "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

exports.listTargetAssertions = listTargetAssertions;

/**
 * Returns a list of all the target_assertion ids and names
 */
var listTargetAssertionNames = function(res){
	models.targetAssertion.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing target_assertion id - name "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

exports.listTargetAssertionNames = listTargetAssertionNames;


/**
 * Creates a new target_assertion from the data POSTed
 * See the TargetAssertion schema in models.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
 */
var createTargetAssertion = function(data, res){
	saveTargetAssertion(data, function(err, val, newLoc) {
		if(err){
			logger.error('Error saving target_assertion', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid target_assertion ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('TargetAssertion saved ' + JSON.stringify(newLoc));
			res.json({id:newLoc._id});
		}
		res.end();
	});
};

exports.createTargetAssertion = createTargetAssertion;

/**
 * saveTargetAssertion is a "generic" save method callable from both
 * request-response methods and parser-type methods for population of target_assertion data
 * 
 * saveTargetAssertion calls the validateTargetAssertion module to ensure that the
 * target_assertion data being saved to the database is complete and has integrity.
 * 
 * saveCallback takes the form of  function(err, valid object, target_assertion object)
 */
var saveTargetAssertion = function(data, saveCallback) {
	validateTargetAssertion(data, function(valid) {
		if (valid.valid) {
			logger.info("Valid target_assertion");
			var newLoc = new models.targetAssertion(data);
			newLoc.createdDate = new Date();
			newLoc.updatedDate = new Date();
			newLoc.save(function(err){
				if(err){
					logger.error('Error saving target_assertion', err);
				}
				saveCallback(err, valid, newLoc);
			});
		}
		else {
			saveCallback(undefined, valid, data);
		}
	});
};

exports.saveTargetAssertion = saveTargetAssertion;

/**
 * validateTargetAssertion validates a target_assertion object against the target_assertion semantic rules
 * and the business rules associated with a target_assertion
 *
 * validateTargetAssertion calls the JSON validation module  revalidator and
 * calls the business validation module bvalidator for the target_assertion object

 * data is the target_assertion object being validated
 * 
 * valCallback takes the form of  function(valid structure)
 */
var validateTargetAssertion = function(data, valCallback) {
	// is the JSON semantically valid for the target_assertion object?
	var valid = revalidator.validate(data, validationModel.targetAssertionValidation);
	if (valid.valid) {
		// does the target_assertion object comply with business validation logic
		bvalidator.validate(data, function(valid) {
			valCallback(valid);
		});
	}
	else {
		valCallback(valid);
	}	
};

exports.validateTargetAssertion = validateTargetAssertion;

/**
 * Returns the target_assertion with the id specified in the URL
 */
var getTargetAssertion = function(id, res){
	models.targetAssertion.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting target_assertion "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(docs) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};

exports.getTargetAssertion = getTargetAssertion;

/**
 * getTargetAssertionByName
 */
var getTargetAssertionByName = function(value, res){
	models.targetAssertion.find({name:value}, function(err, docs){
		if(err) {
			logger.info("Error getting targetAssertionByName "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(0 !== docs.length) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};

exports.getTargetAssertionByName = getTargetAssertionByName;

/**
 * readTargetAssertionByProperty is a generic read method to return all of
 * documents that have a property value that matches.
 * 
 * The readCallback should be function(err, docs)
 */
var readTargetAssertionByProperty = function(property, value, readCallback){
	var query = models.targetAssertion.find({});
	query.where(property, value);
	query.exec(readCallback);
};

exports.readTargetAssertionByProperty = readTargetAssertionByProperty;

/**
 * readAssertionByObject is a generic read method for assertion
 * It will attempt to find an exact match(es) for the object provided.
 * 
 * Note: the incoming object can be a subset or superset of the actual object.
 * 
 * The readCallback should be function(err, docs)
 */
var readTargetAssertionByObject = function(object, readCallback){
	var query = models.targetAssertion.find({});
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			query.where(key, object[key]);
		}
	}
	query.exec(readCallback);
};

exports.readTargetAssertionByObject = readTargetAssertionByObject;

/**
 * searchTargetAssertion is experimental -- uses the SEARCH HTTP verb
 */
var searchTargetAssertion = function(data, res){
	models.targetAssertion.find({name:data.name}, function(err, docs){
		if(err) {
			logger.info("Error getting target_assertion "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(docs.length !== 0) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};

exports.searchTargetAssertion = searchTargetAssertion;

/**
 * This updates the target_assertion with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
var updateTargetAssertion = function(id, data, res){
	updateTargetAssertionX(id, data, function(err, val, updLoc) {
		if(err){
			logger.error('Error updating target_assertion', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid target_assertion ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('TargetAssertion updated ' + JSON.stringify(updLoc));
			res.json({id:updLoc._id});
		}
		res.end();
	});
};

exports.updateTargetAssertion = updateTargetAssertion;

/**
 * updateTargetAssertionX calls the validateTargetAssertion then updates the object
 * 
 * callback takes the form of  function(err, valid object, target_assertion object)
 */
var updateTargetAssertionX = function(id, data, updCallback) {
	validateTargetAssertion(data, function(valid){
		if (valid.valid) {
			models.targetAssertion.findById(id, function(err, docs){
				if(err) {
					logger.info("Error getting target_assertion "+err);
					updCallback(err, valid, data);
				} else if(docs) {
					for(var e in data){
						//Make sure not to change _id
						if(e !== '_id'){
							docs[e] = data[e];
						}
					}
					docs.updatedDate = new Date();
					docs.save(function(err){
						if(err){
							updCallback(err, valid, data);
						} else {
							updCallback(err, valid, docs);
						}
					});			
				} else {
					valid.valid = false;
					valid.errors = {expected: id, message: "TargetAssertion not found"};
					updCallback(err, valid, data);
				}
			});
		}
		else {
			updCallback(undefined, valid, data);
		}
	});
};

exports.updateTargetAssertionX = updateTargetAssertionX;

/**
 * Deletes the target_assertion with the given ID
**/
var deleteTargetAssertion = function(id, data, res) {
	models.targetAssertion.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting target_assertion '+id, err);
			res.status('500');
			res.json({error:'Invalid target_assertion '+id});
			res.end();
		} else {
			for(var i = 0; i < docs.length; i++){
				docs[i].remove();
			}
			res.json({status:'ok'});
			res.end();
		}//;
	});
};

exports.deleteTargetAssertion = deleteTargetAssertion;

/**
 * Deletes all target_assertions
**/
var deleteTargetAssertions = function(res) {
	models.targetAssertion.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};

exports.deleteTargetAssertions = deleteTargetAssertions;