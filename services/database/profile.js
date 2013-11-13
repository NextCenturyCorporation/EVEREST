var Bvalidator = require("../../models/profile/bvalidator.js");
var revalidator = require("revalidator");
//var actionEmitter = require("../action_emitter");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.profileValidation;

	var services = {
		profileService: me
	};

	var bvalidator = new Bvalidator(services, logger);

	/**
	 * Returns a list of all Profiles
	 */
	me.list = function(req, callback) {
		paramHandler.handleDefaultParams(req, function (params) {
			if (params !== null) {
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;

				var config = {
					createdDate: {
						$gte: params.start,
						$lte: params.end
					}
				};

				models.profile.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res){
					callback(err, res, config);
				});
			} else {
				models.profile.find({}, function(err, res){
					callback(err, res, {});
				});
			}
		});
	};

	/**
	 * Returns a list of indexed attributes for Profile
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.profile.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++){
			if (models.profile.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}

		callback(indexes);
	};

	/**
	 * Returns a sorted list containing _id and createdDate for all Profiles
	 */
	me.findDates = function(callback) {
		models.profile.find({}, {_id: 0, createdDate: 1}, function(err, dates) {
			var errorMsg = new Error("Could not get Profile Dates: " + err);
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
	 * Returns the Date version of parameter string.createdDate
	 */
	me.flattenArray = function(string, callback) {
		callback(null, Date.parse(string.createdDate));
	};

	/**
	 * Returns the number of Profiles that fit in the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.profile.count(config, callback);
	};

	/**
	 * Returns only the fields specified in field_string for each Profile
	 */
	me.listFields = function(params, field_string, callback) {
		models.profile.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both 
	 * request-response methods and parser-type methods for population of
	 * Profile data
	 *
	 * create calls the validateProfile module to ensure that the data being
	 * saved to the database is complete and has integrity
	 *
	 * saveCallback takes the form function(err, valid object, Profile object)
	 */
	me.create = function(data, saveCallback) {
		me.validateProfile(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Profile");

				var newProfile = new models.profile(data);
				newProfile.save(function(err) {
					if (err) {
						logger.error("Error saving Profile ", err);
					} else {
						//actionEmitter
					}

					saveCallback(err, valid, newProfile);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateProfile validates a Profile object against the Profile 
	 * semantic rules and the business rules associated with a Profile
	 *
	 * validateProfile calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the Profile object

	 * data is the Profile object being validated
	 * 
	 * valCallback takes the form function(valid structure)
	 */
	me.validateProfile = function(data, valCallback) {
		// is the JSON semantically valid for the Profile object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Profile object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}	
	};

	/**
	 * Returns the Profile object with the specified id
	 */
	me.get = function(id, getCallback){
		models.findWhere({_id: id}, getCallback);
	};

	/**
	 * generic read method to returl all documents that have a matching
	 * set of key, value pairs specified by config
	 * 
	 * callback takes the form function(err, docs)
	 */
	me.findWhere = function(config, callback) {
		models.profile.find(config, callback);
	};

	/**
	 * update gets the Profile by the specified id then calls validateProfile
	 * 
	 * callback takes the form function(err, valid object, Profile object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs){
			if (err) {
				logger.error("Error getting Profile", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Profile from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}

				docs.updatedDate = new Date();
				me.validateAlphaReport(docs, function(valid) {
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
				var errorMsg = new Error("Could not find Profile to update");
				updCallback(errorMsg, null, data);
			}
		});
	};

	/**
	 * Remove all Profiles that match the specified config
	 */
	me.del = function(config, deleteCallback) {
		models.profile.remove(config, deleteCallback);
	};
};