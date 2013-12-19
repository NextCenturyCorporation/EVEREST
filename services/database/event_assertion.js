var Bvalidator = require("../../models/event_assertion/bvalidator.js");
var revalidator = require("revalidator");
//var actionEmitter = require("../action_emitter.js");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.eventAssertionValidation;
	
	var services = {
		eventAssertionService: me
	};

	var bvalidator = new Bvalidator(services, logger);

	/**
	 *	Returns a list of all Event Assertions
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

				models.eventAssertion.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, config);
				});
			} else {
				models.eventAssertion.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};
		
	/**
	 *	Returns a list of indexed attributes for Event Assertion
	 */
	me.getIndexes = function(callback){
		var keys = Object.keys(models.eventAssertion.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.eventAssertion.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	/**
	 *	Returns a sorted list containing _id and createdDate for all Event Assertions
	 */
	me.findDates = function(callback) {
		models.eventAssertion.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Event Assertion Dates: " + err);
			if (err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err, results) {
					if(err) {
						callback(errorMsg);
					} else {
						callback(results);
					}
				});
			}
		});
	};

	/**
	 *	Returns the Date version of parameter string.createDate
	 */
	me.flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};

	/**
	 *	Returns the number of Event Assertions that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.eventAssertion.count(config, callback);
	};

	/**
	 * Returns only the fields specified in field_string for each Event Assertion
	 */
	me.listFields = function(params, field_string, callback) {
		models.eventAssertion.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Event Assertion data
	 * 
	 * saveEventAssertion calls the validateEventAssertion module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Event Assertion object)
	 */
	me.create = function(data, saveCallback) {
		me.validateEventAssertion(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Event Assertion");
				
				var newEventAssertion = new models.eventAssertion(data);
				newEventAssertion.save(function(err){
					if (err) {
						logger.error("Error saving Event Assertion", err);
					} else {
						//actionEmitter
					}
					
					saveCallback(err, valid, newEventAssertion);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};
	
	/**
	 * validateEventAssertion validates a Event Assertion object against the Event
	 * Assertion semantic rules and the business rules associated with a Event Assertion
	 *
	 * validateEventAssertion calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the Event Assertion object

	 * data is the Event Assertion object being validated
	 * 
	 * valCallback takes the form function(valid structure)
	 */
	me.validateEventAssertion = function(data, valCallback) {
		// is the JSON semantically valid for the Event Assertion object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Event Assertion object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}	
	};
	
	/**
	 * Returns the Event Assertion object with the specified id
	 */
	me.get = function(id, callback) {
		models.eventAssertion.find({_id: id}, callback);
	};
	
	/**
	 * generic read method to return all documents that have a matching
	 * set of key, value pairs specified by config
	 * 
	 * callback takes the form function(err, docs)
	 */
	me.findWhere = function(config, callback) {
		models.eventAssertion.find(config, callback);
	};
	
	/**
	 * update gets the Event Assertion by the specified id then calls validateEventAssertion
	 *
	 * callback takes the form function(err, valid object, Event Assertion object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Event Assertion", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Event Assertion from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validateEventAssertion(docs, function(valid) {
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
				var errorMsg = new Error("Could not find Event Assertion to update.");
				updCallback(errorMsg, null, data);
			}
		});
	};

	/**
	 * Remove all Event Assertions that match the specified config
	 */
	me.del = function(config, callback) {
		models.eventAssertion.remove(config, callback);
	};
};