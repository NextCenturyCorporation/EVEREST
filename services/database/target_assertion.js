var Bvalidator = require("../../models/target_assertion/bvalidator.js");
var revalidator = require("revalidator");
//var actionEmitter = require("../action_emitter.js");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.targetAssertionValidation;
	
	var services = {
		targetAssertionService: me
	};

	var bvalidator = new Bvalidator(services, logger);

	/**
	 *	Returns a list of all Target Assertions
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
				
				models.targetAssertion.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, config);
				});
			} else {
				models.targetAssertion.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};
		
	/**
	 *	Returns a list of indexed attributes for Target Assertion
	 */
	me.getIndexes = function(callback){
		var keys = Object.keys(models.targetAssertion.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.targetAssertion.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	/**
	 *	Returns a sorted list containing _id and createdDate for all Target Assertions
	 */
	me.findDates = function(callback) {
		models.targetAssertion.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Target Assertion Dates: " + err);
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
	 *	Returns the number of Target Assertions that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.targetAssertion.count(config, callback);
	};

	/**
	 * Returns only the fields specified in field_string for each Target Assertion
	 */
	me.listFields = function(params, field_string, callback) {
		models.targetAssertion.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Target Assertion data
	 * 
	 * saveTargetAssertion calls the validateTargetAssertion module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Target Assertion object)
	 */
	me.create = function(data, saveCallback) {
		me.validateTargetAssertion(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Target Assertion");
				
				var newTargetAssertion = new models.targetAssertion(data);
				newTargetAssertion.save(function(err){
					if (err) {
						logger.error("Error saving Target Assertion", err);
					} else {
						//actionEmitter
					}
					
					saveCallback(err, valid, newTargetAssertion);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};
	
	/**
	 * validateTargetAssertion validates a Target Assertion object against the Target
	 * Assertion semantic rules and the business rules associated with a Target Assertion
	 *
	 * validateTargetAssertion calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the Target Assertion object

	 * data is the Target Assertion object being validated
	 * 
	 * valCallback takes the form function(valid structure)
	 */
	me.validateTargetAssertion = function(data, valCallback) {
		// is the JSON semantically valid for the Target Assertion object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Target Assertion object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}	
	};
	
	/**
	 * Returns the Target Assertion object with the specified id
	 */
	me.get = function(id, callback) {
		models.targetAssertion.find({_id: id}, callback);
	};
	
	/**
	 * generic read method to return all documents that have a matching
	 * set of key, value pairs specified by config
	 * 
	 * callback takes the form function(err, docs)
	 */
	me.findWhere = function(config, callback) {
		models.targetAssertion.find(config, callback);
	};
	
	/**
	 * update gets the Target Assertion by the specified id then calls validateTargetAssertion
	 *
	 * callback takes the form function(err, valid object, Target Assertion object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Target Assertion", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Target Assertion from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validateTargetAssertion(docs, function(valid) {
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
				var errorMsg = new Error("Could not find Target Assertion to update.");
				updCallback(errorMsg, null, data);
			}
		});
	};

	/**
	 * Remove all Target Assertions that match the specified config
	 */
	me.del = function(config, callback) {
		models.targetAssertion.remove(config, callback);
	};
};