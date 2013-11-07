var Bvalidator = require('../../models/assertion/bvalidator.js');
var revalidator = require('revalidator');

var AlphaReportService = require('./alpha_report.js');
var ReporterService = require('./reporter.js');
var actionEmitter = require('../action_emitter.js');
var paramHandler = require('../list_default_handler.js');
var async = require('async');

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.assertionValidation;
	var services = {
		assertionService: me,
		alphaReportService: new AlphaReportService(models, io, logger),
		reporterService: ReporterService //TODO fix this too
	};
	
	var bvalidator = new Bvalidator(services, logger);

	/**
	 * Returns a list of all the assertions
	 */
	me.list = function(req, callback){
		paramHandler.handleDefaultParams(req, function(params){
			if (params !== null) {
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;
				
				var config = {
					createdDate : {
						$gte: params.start,
						$lte: params.end
					}
				};
				
				models.assertion.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res){
					callback(err, res, config);
				});
			} else {
				models.assertion.find({}, function(err, res){
					callback(err, res, {});
				});
			}
		});
	};
	
	/**
	 * Returns a list of all indexed attributes for assertion
	 */
	me.getIndexes = function(callback){
		var keys = Object.keys(models.assertion.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.assertion.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};

	/**
	 * Returns a sorted list containing _id and createdDate for all assertions
	 */
	me.findDates = function(callback) {
		models.assertion.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get feed Dates: " + err);
			if (err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err,results) {
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
	 * Returns the Date version of parameter string.createdDate
	 */
	me.flattenArray = function(string, callback) {
		callback(null, Date.parse(string.createdDate));
	};

	/**
	 * Returns the number of assertions that fit the param config
	 */
	me.getTotalCount = function(config, callback){
		models.assertion.count(config, callback);
	};
	
	/**
	 *
	 */
	me.listFields = function(params, field_string, callback){
		models.assertion.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of assertion data
	 * 
	 * create calls the validateAssertion module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, assertion object)
	 */
	me.create = function(data, saveCallback) {
		me.validateAssertion(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid assertion");
				
				var newAssertion = new models.assertion(data);
				newAssertion.createdDate = new Date();
				newAssertion.updatedDate = new Date();
				newAssertion.save(function(err){
					if (err) {
						logger.error('Error saving assertion ', err);
					} else {
						actionEmitter.saveAssertionEvent(newAssertion);
						//actionEmitter.saveAssertionEvent({data: newAssertion});
					}
					
					saveCallback(err, valid, newAssertion);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateAssertion validates an assertion object against the assertion
	 * semantic rules and the business rules associated with an assertion
	 *
	 * validateAssertion calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the assertion object

	 * data is the object being validated
	 * 
	 * valCallback takes the form of function(valid structure)
	 */
	me.validateAssertion = function(data, valCallback) {
		// is the JSON semantically valid for the assertion object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the assertion object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		}
		else {
			valCallback(valid);
		}
	};

	/**
	 * Returns the assertion with the id specified in the URL
	 */
	me.get = function(id, callback) {
		me.findWhere({_id: id}, callback);
	};

	/**
	 * findWhere is a generic read method to return all documents that have
	 * a matching set of key, value pairs specified by config
	 *
	 * callback takes the form of function(err, docs)
	 */
	me.findWhere = function(config, callback) {
		models.assertion.find(config, callback);
	};

	/**
	 * update calls the validateAssertion then updates the object
	 * 
	 * callback takes the form function(err, valid object, Assertion object)
	 */
	me.update = function(id, data, updCallback) {
		me.validateAssertion(data, function(valid){
			if (valid.valid) {
				models.assertion.get(id, function(err, docs){
					if (err) {
						logger.info("Error getting assertion " + err);
						updCallback(err, valid, data);
					} else if (docs) {
						docs = docs[0];
						for (var e in data) {
							//Make sure not to change _id
							if (e !== '_id') {
								docs[e] = data[e];
							}
						}
						
						docs.updatedDate = new Date();
						docs.save(function(err){
							if (err) {
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});
					} else {
						valid.valid = false;
						valid.errors = {expected: id, message: "Assertion not found"};
						updCallback(err, valid, data);
					}
				});
			} else {
				updCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * Remove all assertions that match the parameter config
	 */
	me.del = function(config, callback) {
		models.assertion.remove(config, callback);
	};
};