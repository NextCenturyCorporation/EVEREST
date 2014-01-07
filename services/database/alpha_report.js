var Bvalidator = require("../../models/alpha_report/bvalidator.js");
var revalidator = require("revalidator");
var RawFeedService = require("./raw_feed");
var actionEmitter = require("../action_emitter.js");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.alphaReportValidation;

	var services = {
		alphaReportService: me,
		rawFeedService: new RawFeedService(models, io, logger)
	};

	var bvalidator = new Bvalidator(services, logger);

	/**
	 * Returns a list of all Alpha Reports
	 */
	me.list = function(req, callback) {
		paramHandler.handleDefaultParams(req, function(params) {
			if (params !== null) {
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;
				
				var config = {}
				config[params.date] = {
					$gte: params.start,
					$lte: params.end
				};
				
				models.alphaReport.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, config);
				});
			} else {
				models.alphaReport.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};
	
	me.getTags = function(callback) {
		var o = {
			map : function () { 
				if (!this.message_body || !this._id) { return; }
				var stripped = this.message_body.replace(/[\.,!$%\^&\*;:{}=`~()\[\]\"]/g, '');
				stripped = stripped.replace(/[\n\t]/g, ' ');
				var words = stripped.split(' ');
				var counts = {};
				for (index in words) {
					var text = words[index].toLowerCase();
					if (counts.hasOwnProperty(text)) {
						counts[text].count++;
					} else {
						counts[text] = {
							count: 1, 
							reports: [this._id]
						}
					}
				}

				for (key in counts) {
					emit(key, counts[key]);
				}
			}, 
			reduce: function(k, vals) { 
				var reduced = {
					reports: [],
					count: 0
				};

				for (index in vals) {
					reduced.count += vals[index].count;
					reduced.reports.push(vals[index].reports[0]);
				}

				return reduced;
			},
			out: {
				replace: 'tags'
			},
			verbose: true
		};

		models.alphaReport.mapReduce(o, function(err, model, stats) {
			console.log(stats);
			model.find().exec(callback)
		});
	};

	/*;*/

	/**
	 *	Returns a list of indexed attributes for Alpha Report
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.alphaReport.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.alphaReport.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	/**
	*	Returns a list of date attributes for Alpha Report
	*/
	me.getDateTypes = function(callback) {
		var keys = Object.keys(models.alphaReport.schema.paths);
		var dateTypes = [];
		for (var i = 0; i < keys.length; i++) {
			if (models.alphaReport.schema.tree[keys[i]].type === Date) {
				dateTypes.push(keys[i].toString());
			}
		}
	
		callback(dateTypes);
	};

	/**
	 *	Returns a sorted list containing _id and createdDate for all Alpha Reports
	 */
	me.findDates = function(callback) {
		models.alphaReport.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Alpha Report Dates: " + err);
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
	me.flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};
	
	/**
	 *	Returns the number of Alpha Reports that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.alphaReport.count(config, callback);
	};

	/**
	 * Returns only the fields specified in field_string for each Alpha Report
	 */
	me.listFields = function(params, field_string, callback) {
		models.alphaReport.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population 
	 * of Alpha Report data
	 * 
	 * create calls the validateAlphaReport module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Alpha Report object)
	 */
	me.create = function(data, saveCallback) {
		me.validateAlphaReport(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Alpha Report");
				
				var newAlphaReport = new models.alphaReport(data);
				newAlphaReport.save(function(err) {
					if (err) {
						logger.error("Error saving Alpha Report ", err);
					} else {
						actionEmitter.saveAlphaReportEvent(newAlphaReport);
					}

					saveCallback(err, valid, newAlphaReport);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateAlphaReport validates an Alpha Report object against the Alpha Report
	 * semantic rules and the business rules associated with an AlphaReport
	 *
	 * validateAlphaReport calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the AlphaReport object

	 * data is the object being validated
	 * 
	 * valCallback takes the form function(valid structure)
	 */
	me.validateAlphaReport = function(data, valCallback) {
		// is the JSON semantically valid for the Alpha Report object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Alpha Report object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};

	/**
	 * Returns the Alpha Report object with the specified id
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
		models.alphaReport.find(config, callback);
	};

	/**
	 * update gets the Alpha Report by the specified id then calls validateAlphaReport
	 *
	 * callback takes the form function(err, valid object, Alpha Report object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Alpha Report", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Alpha Report from the get
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
						//valid.valid = false;
						//valid.errors = {expected: id, message: "Updated Alpha Report information not valid"};
						updCallback(err, valid, data);
					}
				});
			} else {
				var errorMSG = new Error("Could not find Alpha Report to update");
				updCallback(errorMSG, null, data);
			}
		});
	};

	/**
	 * Remove all Alpha Reports that match the parameter config
	 */
	me.del = function(config, callback) {
		models.alphaReport.remove(config, callback);
	};
};