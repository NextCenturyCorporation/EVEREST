/**
 * Runs while connected to a database
 */
var winston = require('winston');
var models = require('../../models/models');
var validationModel = require('../../models/target_event/model.js');
var bvalidator = require('../../models/target_event/bvalidator.js');
var revalidator = require('revalidator');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * Returns a list of all the target_events
 */
var listTargetEvents = function(res){
	models.targetEvent.find({}, function(err, docs){
		if(err){
			logger.info("Error listing target_events "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

exports.listTargetEvents = listTargetEvents;

/**
 * Returns a list of all the target_event ids and names
 */
var listTargetEventNames = function(res){
	models.targetEvent.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing target_event id - name "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

exports.listTargetEventNames = listTargetEventNames;


/**
 * Creates a new target_event from the data POSTed
 * See the TargetEvent schema in models.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
 */
var createTargetEvent = function(data, res){
	saveTargetEvent(data, function(err, val, newObj) {
		if(err){
			logger.error('Error saving target_event', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid target_event ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors});
		} else {
			logger.info('TargetEvent saved ' + JSON.stringify(newObj));
			res.json({id:newObj._id});
		}
		res.end();
	});
};

exports.createTargetEvent = createTargetEvent;

/**
 * saveTargetEvent is a "generic" save method callable from both
 * request-response methods and parser-type methods for population of target_event data
 * 
 * saveTargetEvent calls the validateTargetEvent module to ensure that the
 * target_event data being saved to the database is complete and has integrity.
 * 
 * saveCallback takes the form of  function(err, valid object, target_event object)
 */
var saveTargetEvent = function(data, saveCallback) {
	validateTargetEvent(data, function(valid) {
		if (valid.valid) {
			logger.info("Valid target_event");
			var newObj = new models.targetEvent(data);
			newObj.createdDate = new Date();
			newObj.updatedDate = new Date();
			newObj.save(function(err){
				if(err){
					logger.error('Error saving target_event', err);
				}
				saveCallback(err, valid, newObj);
			});
		}
		else {
			saveCallback(undefined, valid, data);
		}
	});
};

exports.saveTargetEvent = saveTargetEvent;

/**
 * validateTargetEvent validates a target_event object against the target_event semantic rules
 * and the business rules associated with a target_event
 *
 * validateTargetEvent calls the JSON validation module  revalidator and
 * calls the business validation module bvalidator for the target_event object

 * data is the target_event object being validated
 * 
 * valCallback takes the form of  function(valid structure)
 */
var validateTargetEvent = function(data, valCallback) {
	// is the JSON semantically valid for the target_event object?
	var valid = revalidator.validate(data, validationModel.targetEventValidation);
	if (valid.valid) {
		// does the target_event object comply with business validation logic
		bvalidator.validate(data, function(valid) {
			valCallback(valid);
		});
	}
	else {
		valCallback(valid);
	}	
};

exports.validateTargetEvent = validateTargetEvent;

/**
 * Returns the target_event with the id specified in the URL
 */
var getTargetEvent = function(id, res){
	models.targetEvent.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting target_event "+err);
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

exports.getTargetEvent = getTargetEvent;

/**
 * getTargetEventByName
 */
var getTargetEventByName = function(value, res){
	models.targetEvent.find({name:value}, function(err, docs){
		if(err) {
			logger.info("Error getting targetEventByName "+err);
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

exports.getTargetEventByName = getTargetEventByName;

/**
 * readTargetEventByProperty is a generic read method to return all of
 * documents that have a property value that matches.
 * 
 * The readCallback should be function(err, docs)
 */
var readTargetEventByProperty = function(property, value, readCallback){
	var query = models.targetEvent.find({});
	query.where(property, value);
	query.exec(readCallback);
};

exports.readTargetEventByProperty = readTargetEventByProperty;

/**
 * readEventByObject is a generic read method for event
 * It will attempt to find an exact match(es) for the object provided.
 * 
 * Note: the incoming object can be a subset or superset of the actual object.
 * 
 * The readCallback should be function(err, docs)
 */
var readTargetEventByObject = function(object, readCallback){
	var query = models.targetEvent.find({});
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			query.where(key, object[key]);
		}
	}
	query.exec(readCallback);
};

exports.readTargetEventByObject = readTargetEventByObject;

/**
 * searchTargetEvent is experimental -- uses the SEARCH HTTP verb
 */
var searchTargetEvent = function(data, res){
	models.targetEvent.find({name:data.name}, function(err, docs){
		if(err) {
			logger.info("Error getting target_event "+err);
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

exports.searchTargetEvent = searchTargetEvent;

/**
 * This updates the target_event with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
var updateTargetEvent = function(id, data, res){
	updateTargetEventX(id, data, function(err, val, updLoc) {
		if(err){
			logger.error('Error updating target_event', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid target_event ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('TargetEvent updated ' + JSON.stringify(updLoc));
			res.json({id:updLoc._id});
		}
		res.end();
	});
};

exports.updateTargetEvent = updateTargetEvent;

/**
 * updateTargetEventX calls the validateTargetEvent then updates the object
 * 
 * callback takes the form of  function(err, valid object, target_event object)
 */
var updateTargetEventX = function(id, data, updCallback) {
	validateTargetEvent(data, function(valid){
		if (valid.valid) {
			models.targetEvent.findById(id, function(err, docs){
				if(err) {
					logger.info("Error getting target_event "+err);
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
					valid.errors = {expected: id, message: "TargetEvent not found"};
					updCallback(err, valid, data);
				}
			});
		}
		else {
			updCallback(undefined, valid, data);
		}
	});
};

exports.updateTargetEventX = updateTargetEventX;

/**
 * Deletes the target_event with the given ID
**/
var deleteTargetEvent = function(id, data, res) {
	models.targetEvent.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting target_event '+id, err);
			res.status('500');
			res.json({error:'Invalid target_event '+id});
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

exports.deleteTargetEvent = deleteTargetEvent;

/**
 * Deletes all target_events
**/
var deleteTargetEvents = function(res) {
	models.targetEvent.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};

exports.deleteTargetEvents = deleteTargetEvents;