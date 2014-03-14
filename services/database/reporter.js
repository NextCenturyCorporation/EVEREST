var Bvalidator = require("../../models/reporter/bvalidator.js");
var revalidator = require("revalidator");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.reporterValidation;

	var services = {
		reporterService: me
	};

	var bvalidator = new Bvalidator(services, logger);

	/**
	 * Returns a list of all Reporters
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

				models.reporter.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, config);
				});
			} else {
				models.reporter.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};

	/**
	 *	Returns a list of indexed attributes for Reporter
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.reporter.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.reporter.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}

		callback(indexes);
	};

	/**
	 *	Returns a sorted list containing _id and createdDate for all Reporter
	 */
	me.findDates = function(callback) {
		models.reporter.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Reporter Dates: " + err);
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
	 *	Returns the Date version of parameter string.createDate
	 */
	me.flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};

	/**
	 *	Returns the number of Reporter that fit the parameter config
	 */
	me.getTotalCount = function(config, callback) {
		models.reporter.count(config, callback);
	};

	/**
	 * Returns only the fields specified in field_string for each Reporter
	 */
	me.listFields = function(params, field_string, callback) {
		models.reporter.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Reporter data
	 *
	 * create calls the validateReporter module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 *
	 * saveCallback takes the form function(err, valid object, Reporter object)
	 */
	me.create = function(data, saveCallback) {
		me.validateReporter(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Reporter");

				var newReporter = new models.reporter(data);
				newReporter.save(function(err){
					if (err){
						logger.error("Error saving Reporter ", err);
					}
					//else {
					//	actionEmitter.saveReporterEvent(newReporter);
					//}

					saveCallback(err, valid, newReporter);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateReporter validates an Reporter object against the Reporter
	 * semantic rules and the business rules associated with a Reporter
	 *
	 * validateReporter calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the Reporter object

	 * data is the object being validated
	 *
	 * valCallback takes the form function(valid structure)
	 */
	me.validateReporter = function(data, valCallback) {
		// is the JSON semantically valid for the Reporter object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Reporter object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};

	/**
	 * Returns the Reporter object with the specified id
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
		models.reporter.find(config, callback);
	};

	/**
	 * update gets the Reporter by the specified id then calls validateReporter
	 *
	 * callback takes the form function(err, valid object, Reporter object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Reporter", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Reporter from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}

				docs.updatedDate = new Date();
				me.validateReporter(docs, function(valid) {
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
				var errorMSG = new Error("Could not find Reporter to update");
				updCallback(errorMSG, null, data);
			}
		});
	};

	/**
	 * Remove all Target Events that match the specified config
	 */
	me.del = function(config, callback){
		models.reporter.remove(config, callback);
	};
};