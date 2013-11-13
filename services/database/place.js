var Bvalidator = require("../../models/place/bvalidator.js");
var revalidator = require("revalidator");
//var actionEmitter = require("../action_emitter");
var paramHandler = require("../list_default_handler");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.placeValidation;
	
	var services = {
		placeService: me
	};
	
	var bvalidator = new Bvalidator(services, logger);

	/**
	 * Returns a list of all Places
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
								
				models.place.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, config);
				});
			} else {
				models.place.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};

	/**
	 * Returns a list of indexed attributes for Place
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.place.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.place.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};

	/**
	 *	Returns a sorted list containing _id and createdDate for all Places
	 */
	me.findDates = function(callback) {
		models.place.find({}, {_id: 0, createdDate: 1}, function(err, dates) {
			var errorMsg = new Error("could not get place Dates: " + err);
			if (err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err, res) {
					if (err) {
						callback(errorMsg);
					} else {
						callback(res);
					}
				});
			}
		});
	};
	
	/**
	 *	Returns the Date version of parameter string.createdDate
	 */
	me.flattenArray = function(string, callback) {
		callback(null, Date.parse(string.createdDate));
	};
	
	/**
	 *	Returns the number of Places that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.place.count(config, callback);
	};
	
	/**
	 * Returns only the fields specified in field_string for each Place
	 */
	me.listFields = function(params, field_string, callback) {
		models.place.find(params, field_string, callback);
	};
	
	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Place data
	 * 
	 * create calls the validatePlace module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Place object)
	 */
	me.create = function(data, saveCallback) {		
		me.validatePlace(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Place");

				var newPlace = new models.place(data);
				newPlace.save(function(err) {
					if (err) {
						logger.error("Error saving Place ", err);
					} else {
						//actionEmitter
					}

					saveCallback(err, valid, newPlace);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};
	
	/**
	 * validatePlace validates a place object against the place semantic rules
	 * and the business rules associated with a place
	 *
	 * validatePlace calls the JSON validation module  revalidator and
	 * calls the business validation module bvalidator for the place object
	
	 * data is the place object being validated
	 * 
	 * valCallback takes the form of function(valid structure)
	 */
	me.validatePlace = function(data, valCallback){
		// is the JSON semantically valid for the Place object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid){
			//does the Place object comply with business validation logic
			bvalidator.validate(data, function(valid){
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};
	
	/**
	 * Returns the Place object with the specified id
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
		models.place.find(config, callback);
	};

	/**
	 * update gets the Place by the specified id then calls validatePlace
	 * 
	 * callback takes the form function(err, valid object, Place object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs){
			if (err) {
				logger.error("Error getting Place", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Place from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validatePlace(docs, function(valid) {
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
				var errorMsg = new Error("Could not find Place to update");
				updCallback(errorMsg, null, data);
			}
		});
	};
	
	/**
	 * Remove all Places that match the specified config
	 */
	me.del = function(config, callback){
		models.place.remove(config, callback);
	};
};