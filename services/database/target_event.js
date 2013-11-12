var Bvalidator = require('../../models/target_event/bvalidator.js');
var revalidator = require('revalidator');
var TargetAssertionService = require('../../services/database/target_assertion.js');
//var actionEmitter = require('../action_emitter.js');
var paramHandler = require('../list_default_handler.js');
var async = require('async');

module.exports = function(models, io, logger) {
	var me = this;
	
	var validationModel = models.targetEventValidation;
	var services = {
		targetEventService: me,
		targetAssertionService: new TargetAssertionService(models, io, logger)
	};

	var bvalidator = new Bvalidator(services, logger);
	
	/**
	 * Returns a list of all of the Target Events
	 */
	me.list = function(req, callback) {
		paramHandler.handleDefaultParams(req, function(params) {
			if (params !== null) {
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;
				
				var config = {
					createdDate: {
						$gte: params.start,
						$lte: params.end
					}
				};
				
				models.targetEvent.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res){
					callback(err, res, config);
				});
			} else {
				models.targetEvent.find({}, function(err, res){
					callback(err, res, {});
				});
			}
		});
	};
	
	/**
	 * Returns a list of indexed attributes for Target Event
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.targetEvent.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++){
			if (models.targetEvent.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	/**
	 *	Returns a sorted list containing _id and createdDate for all Target Event
	 */
	me.findDates = function(callback) {
		models.targetEvent.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Target Event Dates: " + err);
			if (err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err, results) {
					if (err) {
						callback(errorMsg);
					} else {
						callback(results);
					}
				});
			}
		});
	};
	
	/**
	 * Returns the Date version of the parameter string.createdDate
	 */
	me.flattenArray = function(string, callback) {
		callback(null, Date.parse(string.createdDate));
	};
	
	/**
	 * Returns the number of Target Events that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.targetEvent.count(config, callback);
	};
	
	/**
	 *
	 */
	me.listFields = function(params, field_string, callback) {
		models.targetEvent.find(params, field_string, callback);
	};

	/**
	 * saveTargetEvent is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Target Event data
	 * 
	 * saveTargetEvent calls the validateTargetEvent module to ensure that the
	 * target_event data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Target Event object)
	 */
	me.create = function(data, saveCallback) {
		me.validateTargetEvent(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Target Event");
				
				var newTargetEvent = new models.targetEvent(data);
				newTargetEvent.save(function(err){
					if (err) {
						logger.error('Error saving Target Event', err);
					} else {
						//actionEmitter.saveTargetEvent(newTargetEvent);
					}
					
					saveCallback(err, valid, newTargetEvent);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

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
	me.validateTargetEvent = function(data, valCallback) {
		// is the JSON semantically valid for the Target Event object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Target Event object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};

	/** 
	 *	Returns the Target Event object with id specified in URL
	 */
	me.get = function(id, callback) {
		me.findWhere({_id: id}, callback);
	};
	
	/** 
	 * generic read method to return all documents that have a matching set
	 * of key, value pairs specified by config
	 */
	me.findWhere = function(config, callback) {
		models.targetEvent.find(config, callback);
	};
	
	/**
	 * update calls validateTargetEvent then updates the object
	 *
	 * callback takes the form function(err, valid object, Target Event object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.info("Error getting Target Event " + err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //there will only be one Target Event from the get
				for (var e in data) {
					//Make sure not to change _id
					if (e !== '_id') {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validateTargetEvent(docs, function(valid){
					if (valid.valid) {
						docs.save(function(err){
							if (err) {
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});
					} else {
						updCallback(err, valid, data);
					}
				});
			} else {
				var errorMsg = new Error("Could not find Target Event to update");
				updCallback(errorMsg, null, data);
			}
		});
	};

	me.del = function(config, callback) {
		models.targetEvent.remove(config, callback);
	};
};
