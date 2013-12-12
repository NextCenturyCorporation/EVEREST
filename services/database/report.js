var Bvalidator = require("../../models/report/bvalidator.js");
var revalidator = require("revalidator");
var AlphaReportService = require("./alpha_report.js");
var ProfileService = require("./profile.js");
var TargetEventService = require("./target_event.js");
//var actionEmitter = require("../action_emitter.js");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.reportValidation;

	var services = {
		reportService: me,
		alphaReportService: new AlphaReportService(models, io, logger),
		profileService: new ProfileService(models, io, logger),
		targetEventService: new TargetEventService(models, io, logger)
	};

	var bvalidator = new Bvalidator(services, logger);

	/**
	 * Returns a list of all Reports
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

				models.report.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res){
					callback(err, res, config);
				});
			} else {
				models.report.find({}, function(err, res){
					callback(err, res, {});
				});
			}
		});
	};

	me.listFlattened = function(params, callback) {
		me.list(params, function(err, res) {
			if (err) {
				logger.error("Error listing Reports", err);
				callback(err, res);
			} else {
				async.each(res, function(report, callback) {
					me.flattenReport(report, function(err, updatedReport) {
						if (!err) {
							report = updatedReport;
						}
						callback(err);
					});
				}, function(err) {
					callback(err, res);
				});
			}
		});
	};


	me.getFlattened = function(id, callback) {
		me.get(id, function(err, report) {
			//FIXME handle err
			console.log(report);
			me.flattenReport(report[0], callback);
		});
	};

	me.flattenReport = function(report, callback) {
		var fieldsToFlatten = ["alpha_report_id"/*, "target_event_id"*/, "profile_id", "assertions"];

		async.each(fieldsToFlatten, function(field, fieldCallback) {
			if (field === "assertions") {
				if (report.assertions.length > 0) {
					var flattenedAssertions = [];
					async.each(report.assertions, function(assertion, assertionCallback) {
						me.flattenField(report, assertion, function(err, flattenedField) {
							if (err) {
								assertionCallback(err);
							} else {
								flattenedAssertions.put(flattenedField);
								assertionCallback();
							}
						});
					}, function(err) {
						report.assertions = flattenedAssertions;
						fieldCallback(err);
					});
				} else {
					//no assertions in array -- leave report as is
					fieldCallback();
				}
			} else {
				if(typeof(report[field]) !== "undefined" && report[field] !== null) {
					me.flattenField(report, field, function(err, flattenedField) {
						if (err) {
							fieldCallback(err);
						} else {
							report[field] = flattenedField[0];
							fieldCallback();
						}
					});
				} else {
					//TODO Add error to callback
					fieldCallback();
				}
			}
		}, function(err) {
			console.log("end");
			callback(err, report);
		});
	};

	me.flattenField = function(report, field, callback) {
		if (field === "alpha_report_id") {
			services.alphaReportService.get(report.alpha_report_id, callback);
		} else if (field === "target_event_id") {
			services.targetEventService.get(report.target_event_id, callback);
		} else if (field === "profile_id") {
			services.profileService.get(report.profile_id, callback);
		}
	};

	/**
	 * Returns a list of indexed attributes for Report
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.report.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.report.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}

		callback(indexes);
	};

	/**
	 *	Returns a sorted list containing _id and createdDate for all Reports
	 */
	me.findDates = function(callback) {
		models.report.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Report Dates: " + err);
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
	 *	Returns the Date version of parameter string.createdDate
	 */
	me.flattenArray = function(string, callback) {
		callback(null, Date.parse(string.createdDate));
	};

	/**
	 *	Returns the number of Reports that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.report.count(config, callback);
	};

	/**
	 * Returns only the fields specified in field_string for each Report
	 */
	me.listFields = function(params, field_string, callback) {
		models.report.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Report data
	 *
	 * create calls the validateReport module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 *
	 * saveCallback takes the form function(err, valid object, Report object)
	 */
	me.create = function(data, saveCallback) {
		me.validateReport(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Report");

				var newReport = new models.report(data);
				newReport.save(function(err) {
					if (err) {
						logger.error("Error saving Report ", err);
					} else {
						//actionEmitter
					}

					saveCallback(err, valid, newReport);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateReport validates an Report object against the Report
	 * semantic rules and the business rules associated with an Report
	 *
	 * validateReport calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the Report object

	 * data is the object being validated
	 *
	 * valCallback takes the form function(valid structure)
	 */
	me.validateReport = function(data, valCallback) {
		// is the JSON semantically valid for the Report object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Report object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};

	/**
	 * Returns the Report object with the specified id
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
		models.report.find(config, callback);
	};

	/**
	 * update gets the Report by the specified id then calls validateReport
	 *
	 * callback takes the form function(err, valid object, Report object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Report", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Report from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}

				docs.updatedDate = new Date();
				me.validateReport(docs, function(valid) {
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
				var errorMSG = new Error("Could not find Report to update");
				updCallback(errorMSG, null, data);
			}
		});
	};

	/**
	 * Remove all Reports that match the specified config
	 */
	me.del = function(config, callback) {
		models.report.remove(config, callback);
	};
};