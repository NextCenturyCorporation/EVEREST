var revalidator = require("revalidator");
var actionEmitter = require("../action_emitter.js");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.rawFeedValidation;
	
	/**
	 * Returns a list of all Raw Feeds
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
				
				models.rawFeed.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, config);
				});
			} else {
				models.rawFeed.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};
			
	/**
	 *	Returns a list of indexed attributes for Raw Feed
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.rawFeed.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.rawFeed.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	/**
	 *	Returns a sorted list containing _id and createdDate for all Raw Feeds
	 */
	me.findDates = function(callback) {
		models.rawFeed.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get feed Dates: " + err);
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
	 *	Returns the number of Raw Feed that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.rawFeed.count(config, callback);
	};
	
	/**
	 * Returns only the fields specified in field_string for each Raw Feed
	 */
	me.listFields = function(params, field_string, callback) {
		models.rawFeed.find(params, field_string, callback);
	};
	
	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Raw Feed data
	 * 
	 * create calls the validateRawFeed module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Raw Feed object)
	 */
	me.create = function(data, callback) {
		me.validateRawFeed(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Raw Feed");

				var newFeed = new models.rawFeed(data);
				newFeed.save(function(err) {
					if (err) {
						logger.error("Error saving Raw Feed", err);
					} else {
						actionEmitter.saveFeedEvent(newFeed);
					}
	
					callback(err, valid, newFeed);
				});
			} else {
				callback(undefined, valid, data);
			}
		});
	};
	
	/**
	 * validateRawFeed validates an Alpha Report object against the Raw Feed
	 * semantic rules and the business rules associated with a Raw Feed
	 *
	 * validateRawFeed calls the JSON validation module revalidator
	 *
	 * data is the object being validated
	 * 
	 * valCallback takes the form function(valid structure)
	 */
	me.validateRawFeed = function(data, valCallback) {
		// is the JSON semantically valid for the Raw Feed object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Raw Feed object comply with business validation logic
			//bvalidator.validate(data, function(valid) {
			//	valCallback(valid);
			//});
			valCallback(valid);
		} else {
			valCallback(valid);
		}	
	};
	
	/**
	 * Returns the Raw Feed object with the specified id
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
		models.rawFeed.find(config, callback);
	};
	
	/**
	 * update gets the Raw Feed by the specified id then calls validateRawFeed
	 *
	 * callback takes the form function(err, valid object, Raw Feed object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Raw Feed", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Raw from the get
				for (var e in data) {
					//Make sure not to change _id
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validateRawFeed(docs, function(valid) {
					if (valid.valid) {
						docs.save(function(err) {
							if (err) {
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});	
					} else {
						valid.valid = false;
						valid.errors = {expected: id, message: "Updated Raw Feed information not valid"};
						updCallback(err, valid, data);
					}
				});		
			} else {
				var errorMsg = new Error("Could not find Raw Feed to update.");
				updCallback(errorMsg, null, data);
			}
		});
	};
	
	/**
	 * Remove all Raw Feeds that match the specified config
	 */
	me.del = function(params, callback){
		models.rawFeed.remove(params, callback);
	};
};