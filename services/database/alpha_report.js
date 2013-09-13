var Bvalidator = require('../../models/alpha_report/bvalidator.js');
var revalidator = require('revalidator');
var RawFeedService = require('./raw_feed');
var actionEmitter = require('../action_emitter.js');

module.exports = function(models, io, logger) {
	var me = this;

	var validationModel = models.alphaReportValidation;

	var services = {
		alphaReportService: me,
		rawFeedService: new RawFeedService(models, io, logger)
	};
	var bvalidator = new Bvalidator(services, logger);

	/**
	 *	Returns a list of all the alpha reports
	 */
	me.list = function(params, callback){
		//TODO handle apging params
		models.alphaReport.find(params, callback);
	};

	me.listFields = function(params, field_string, callback) {
		models.alphaReport.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of AlphaReport data
	 * 
	 * saveAlphaReport calls the validateAlphaReport module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form of  function(err, valid object, AlphaReport object)
	 */
	me.create = function(data, saveCallback) {
		me.validateAlphaReport(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid AlphaReport");
				var newAlphaReport = new models.alphaReport(data);
				newAlphaReport.createdDate = new Date();
				newAlphaReport.updatedDate = new Date();
				newAlphaReport.save(function(err){
					if(err){
						logger.error('Error saving AlphaReport ', err);
					} else {
						actionEmitter.saveAlphaReportEvent({data: newAlphaReport});
					}
					saveCallback(err, valid, newAlphaReport);

				});
			}
			else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateAlphaReport validates an AlphaReport object against the AlphaReport semantic rules
	 * and the business rules associated with an AlphaReport
	 *
	 * validateAlphaReport calls the JSON validation module  revalidator and
	 * calls the business validation module bvalidator for the AlphaReport object

	 * data is the object being validated
	 * 
	 * valCallback takes the form of  function(valid structure)
	 */
	me.validateAlphaReport = function(data, valCallback) {
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
	 * Returns the alpha report object with id specified in URL
	 */
	me.get = function(id, callback){
		me.findWhere({_id: id}, callback);
	};

	/**
	 * readAlphaReportByProperty is a generic read method to return all of
	 * documents that have a property value that matches.
	 */
	me.findWhere = function(config, callback){
		models.alphaReport.find(config, callback);
	};

	me.update = function(id, data, updCallback) {
		me.validateAlphaReport(data, function(valid){
			if (valid.valid) {
				models.alphaReport.findById(id, function(err, docs){
					if(err) {
						logger.info("Error getting AlphaReport "+err);
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
						valid.errors = {expected: id, message: "AlphaReport not found"};
						updCallback(err, valid, data);
					}
				});
			}
			else {
				updCallback(undefined, valid, data);
			}
		});
	};

	me.del = function(config, callback){
		models.alphaReport.remove(config, callback);
	};
};