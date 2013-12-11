var Bvalidator = require("../../models/event/bvalidator.js");
var revalidator = require("revalidator");
//var actionEmitter = require("../action_emitter.js");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.eventValidation;

	var services = {
		eventService: me
	};

	var bvalidator = new Bvalidator(services, logger);
	
	/**
	 * Returns a list of all events
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
				
				models.event_.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, config);
				});
			} else {
				models.event_.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};
	
	/**
	 * Returns a list of indexed attributes for event_
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.event_.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.event_.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	/**
	 *	Returns a sorted list containing _id and createdDate for all event
	 */
	me.findDates = function(callback) {
		models.event_.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get event Dates: " + err);
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
	 * Returns the number of events that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.event_.count(config, callback);
	};
	
	/**
	 * Returns only the fields specified in field_string for each event_
	 */
	me.listFields = function(params, field_string, callback) {
		models.event_.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of event data
	 * 
	 * create calls the validateEvent module to ensure that the
	 * event data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, event object)
	 */
	me.create = function(data, saveCallback) {
		me.validateEvent(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid event_");
				
				var newevent_ = new models.event_(data);
				newevent_.save(function(err) {
					if (err) {
						logger.error("Error saving event_", err);
					} else {
						//actionEmitter
					}
					
					saveCallback(err, valid, newevent_);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateEvent validates a event object against the Event 
	 * semantic rules and the business rules associated with a event
	 *
	 * validateEvent calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the event object

	 * data is the event object being validated
	 * 
	 * valCallback takes the form of function(valid structure)
	 */
	me.validateEvent = function(data, valCallback) {
		// is the JSON semantically valid for the event object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the event_ object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};

	/** 
	 *	Returns the event_ object with the specified id
	 */
	me.get = function(id, callback) {
		me.findWhere({_id: id}, callback);
	};
	
	/**
	 * generic read method to return all documents that have a matching
	 * set of key, value pairs specified by config
	 * 
	 * callback takes the form function(err, docs)
	 */
	me.findWhere = function(config, callback) {
		models.event_.find(config, callback);
	};
	
	/**
	 * update gets the event by the specified id then calls validateEvent
	 *
	 * callback takes the form function(err, valid object, event object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting event", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //there will only be one event from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validateEvent(docs, function(valid) {
					if (valid.valid) {
						docs.save(function(err) {
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
				var errorMsg = new Error("Could not find event to update");
				updCallback(errorMsg, null, data);
			}
		});
	};

	/**
	 * Remove all events that match the specified config
	 */
	me.del = function(config, callback) {
		models.event_.remove(config, callback);
	};
};