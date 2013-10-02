var Bvalidator = require('../../models/assertion/bvalidator.js');
var revalidator = require('revalidator');

var AlphaReportService = require('./alpha_report.js');
var ReporterService = require('./reporter.js');
var actionEmitter = require('../action_emitter.js');

module.exports = function(models, io, logger) {
	var me = this;

	var validationModel = models.assertionValidation;
	var services = {
		assertionService: me,
		alphaReportService: new AlphaReportService(models, io, logger),
		reporterService: ReporterService
	};
	var bvalidator = new Bvalidator(services, logger);

	/**
	 * Returns a list of all the assertions
	 */
	me.listAssertions = function(config, callback){
		//TODO handle paging
		models.assertion.find({}, callback);
	};

	/**
	 * saveAssertion is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of assertion data
	 * 
	 * saveAssertion calls the validateAssertion module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form of  function(err, valid object, assertion object)
	 */
	me.create = function(data, saveCallback) {
		me.validateAssertion(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid assertion");
				var newAssertion = new models.assertion(data);
				newAssertion.createdDate = new Date();
				newAssertion.updatedDate = new Date();
				newAssertion.save(function(err){
					if(err){
						logger.error('Error saving assertion ', err);
					} else {
						actionEmitter.saveAssertionEvent({data: newAssertion});
					}
					saveCallback(err, valid, newAssertion);
				});
			}
			else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateAssertion validates an assertion object against the assertion semantic rules
	 * and the business rules associated with an assertion
	 *
	 * validateAssertion calls the JSON validation module  revalidator and
	 * calls the business validation module bvalidator for the assertion object

	 * data is the object being validated
	 * 
	 * valCallback takes the form of  function(valid structure)
	 */
	me.validateAssertion = function(data, valCallback) {
		// is the JSON semantically valid for the location object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the location object comply with business validation logic
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

	me.findWhere = function(config, callback) {
		models.assertion.find(config, callback);
	};

	/**
	 * readAssertionByProperty is a generic read method to return all of
	 * documents that have a property value that matches.
	 * 
	 * The readCallback should be function(err, docs)
	 */
	me.readAssertionByProperty = function(property, value, readCallback){
		if ( (property !== undefined) && (value !== undefined) ) {
			var query = models.assertion.find({});
			query.where(property, value);
			query.exec(readCallback);
		}
	};

	/**
	 * readAssertionByObject is a generic read method for assertion
	 * It will attempt to find an exact match(es) for the object provided.
	 * 
	 * Note: the incoming object can be a subset or superset of the actual object.
	 * 
	 * The readCallback should be function(err, docs)
	 */
	me.readAssertionByObject = function(object, readCallback){
		if ( object !== undefined ) {
			var query = models.assertion.find({});
			for (var key in object) {
				if (object.hasOwnProperty(key)) {
					query.where(key, object[key]);
				}
			}
			query.exec(readCallback);
		}
	};

	/**
	 * update calls the validateAssertion then updates the object
	 * 
	 * callback takes the form of  function(err, valid object, Assertion object)
	 */
	me.update = function(id, data, updCallback) {
		me.validateAssertion(data, function(valid){
			if (valid.valid) {
				models.assertion.findById(id, function(err, docs){
					if(err) {
						logger.info("Error getting assertion "+err);
						updCallback(err, valid, data);
					} else if(docs) {
						for(var e in data){
							//Make sure not to change _id
							if(e !== '_id'){
								docs[e] = data[e];
							}
						}
						docs.updatedDate = new Date();
						docs.save(function(err){
							if(err){
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
			}
			else {
				updCallback(undefined, valid, data);
			}
		});
	};


	me.del = function(config, callback) {
		models.assertion.remove(config, callback);
	};
};