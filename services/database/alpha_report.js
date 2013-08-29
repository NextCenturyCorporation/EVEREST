var general = require('../wizard_service');
var Bvalidator = require('../../models/alpha_report/bvalidator.js');
var revalidator = require('revalidator');
var RawFeedService = require('./raw_feed');

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
	me.listAlphaReports = function(res){
		models.alphaReport.find({}, function(err, docs){
			if(err){
				logger.info("Error listing alpha reports " + err);
				general.send500(res);
			} else { 
				res.json(docs);
				res.end();
			}
		});
	};

	/**
	 *	Returns a list of all the reporters by id and source id
	 */
	me.listAlphaReportSourceIds = function(res){
		models.alphaReport.find({}, '_id source_id', function(err, docs){
			if(err){
				logger.info("Error listing alpha report id - source_id" + err);
				general.send500(res);
			} else { 
				res.json(docs);
				res.end();
			}
		});
	};

	/**
	 * Creates a new alphaReport object based on the data POSTed.
	 * See the AlphaReport schema for details on what to post.
	 * All validation is handled through the schema.
	 *
	 * On success, it returns the new id 
	 */
	me.createAlphaReport = function(data, res){
		me.saveAlphaReport(data, function(err, val, newAlphaReport) {
			if(err){
				logger.error('Error saving AlphaReport', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid AlphaReport ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('AlphaReport saved ' + JSON.stringify(newAlphaReport));
				res.json({id:newAlphaReport._id});
			}
			res.end();
		});
	};

	/**
	 * saveAlphaReport is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of AlphaReport data
	 * 
	 * saveAlphaReport calls the validateAlphaReport module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form of  function(err, valid object, AlphaReport object)
	 */
	me.saveAlphaReport = function(data, saveCallback) {
		me.validateAlphaReport(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid AlphaReport");
				var newAlphaReport = new models.alphaReport(data);
				newAlphaReport.createdDate = new Date();
				newAlphaReport.updatedDate = new Date();
				newAlphaReport.save(function(err){
					if(err){
						logger.error('Error saving AlphaReport ', err);
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
	me.getAlphaReport = function(id, res){
		models.alphaReport.findById(id, function(err, docs){
			if(err){
				logger.info('Error getting alpha report ' + err);
				general.send500(res);
			} else if(docs) {
				res.json(docs);
				res.end();
			} else {
				general.send404(res);
			}
		});
	};

	me.getAlphaReportBySource = function(source, res){
		models.alphaReport.find({"source_name":source}, function(err, docs){
			if(err){
				logger.info('Error getting alpha report ' + err);
				general.send500(res);
			} else if(docs) {
				res.json(docs);
				res.end();
			} else {
				general.send404(res);
			}
		});
	};

	me.getAlphaReportBySourceId = function(source_id, res){
		models.alphaReport.find({"source_id":source_id}, function(err, docs){
			if(err){
				logger.info('Error getting alpha report ' + err);
				general.send500(res);
			} else if(docs) {
				res.json(docs);
				res.end();
			} else {
				general.send404(res);
			}
		});
	};

	/**
	 * readAlphaReportByProperty is a generic read method to return all of
	 * documents that have a property value that matches.
	 */
	me.readAlphaReportByProperty = function(property, value, readCallback){
		if ( (property !== undefined) && (value !== undefined) ) {
			var query = models.alphaReport.find({});
			query.where(property, value);
			query.exec(readCallback);
		}
	};

	/**
	 * readAlphaReportByObject is a generic read method for alpha_report
	 * It will attempt to find an exact match(es) for the object provided.
	 * Note: the incoming object can be a subset or superset of the actual object.
	 */
	me.readAlphaReportByObject = function(object, readCallback){
		if ( object !== undefined ) {
			var query = models.alphaReport.find({});
			for (var key in object) {
				if (object.hasOwnProperty(key)) {
					query.where(key, object[key]);
				}
			}
			query.exec(readCallback);
		}
	};

	me.readAlphaReports = function(readCallback){
		var query = models.alphaReport.find({});
		query.exec(readCallback);
	};

	/**
	 * This updates the alpha report with id specified in the URL.
	 * It will not change the id.
	 * On success, it returns the _id value (just like on create)
	 */
	me.updateAlphaReport = function(id, data, res){
		me.updateAlphaReportX(id, data, function(err, val, updated) {
			if(err){
				logger.error('Error updating AlphaReport', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid AlphaReport ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('AlphaReport updated ' + JSON.stringify(updated));
				res.json({id:updated._id});
			}
			res.end();
		});
	};

	/**
	 * updateAlphaReportX calls the validateAlphaReport then updates the object
	 * 
	 * callback takes the form of  function(err, valid object, AlphaReport object)
	 */
	me.updateAlphaReportX = function(id, data, updCallback) {
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

	/**
	 * Deletes the alpha report with the given id
	 */
	me.deleteAlphaReport = function(id, res){
		models.alphaReport.find({_id:id}, function(err, docs){
			if(err || docs.length === 0){
				logger.error('Error deleting alpha report', err);
				res.status('500');
				res.json({error: 'Invalid alpha report ' + id});
			} else { 
				for (var i = 0; i < docs.length; i++){
					docs[i].remove();
				}
				res.json({status:'ok'});
			}
			res.end();
		});
	};

	/**
	 * Deletes all reporters
	 */
	me.deleteAlphaReports = function(res){
		models.alphaReport.find({}, function(err, docs){
			for(var i = 0; i < docs.length; i++){
				docs[i].remove();
			}
			res.json({status:'ok'});
			res.end();
		});
	};

};