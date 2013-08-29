var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');
var validationModel = require('../../models/alpha_report/model.js');
var bvalidator = require('../../models/alpha_report/bvalidator.js');
var revalidator = require('revalidator');

//Load and set up the Logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file
	transports: [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})]
});

/**
 *	Returns a list of all the alpha reports
 */
 var listAlphaReports = function(res){
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

exports.listAlphaReports = listAlphaReports;

/**
 *	Returns a list of all the reporters by id and source id
 */
var listAlphaReportSourceIds = function(res){
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

exports.listAlphaReportSourceIds = listAlphaReportSourceIds;

/**
 * Creates a new alphaReport object based on the data POSTed.
 * See the AlphaReport schema for details on what to post.
 * All validation is handled through the schema.
 *
 * On success, it returns the new id 
 */
var createAlphaReport = function(data, res){
	saveAlphaReport(data, function(err, val, newAlphaReport) {
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

exports.createAlphaReport = createAlphaReport;

/**
 * saveAlphaReport is a "generic" save method callable from both
 * request-response methods and parser-type methods for population of AlphaReport data
 * 
 * saveAlphaReport calls the validateAlphaReport module to ensure that the
 * data being saved to the database is complete and has integrity.
 * 
 * saveCallback takes the form of  function(err, valid object, AlphaReport object)
 */
var saveAlphaReport = function(data, saveCallback) {
	validateAlphaReport(data, function(valid) {
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

exports.saveAlphaReport = saveAlphaReport;

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
var validateAlphaReport = function(data, valCallback) {
	// is the JSON semantically valid for the location object?
	var valid = revalidator.validate(data, validationModel.alphaReportValidation);
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

exports.validateAlphaReport = validateAlphaReport;

/**
 * Returns the alpha report object with id specified in URL
 */
var getAlphaReport = function(id, res){
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

exports.getAlphaReport = getAlphaReport;

var getAlphaReportBySource = function(source, res){
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

exports.getAlphaReportBySource = getAlphaReportBySource;

var getAlphaReportBySourceId = function(source_id, res){
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

exports.getAlphaReportBySourceId = getAlphaReportBySourceId;

/**
 * readAlphaReportByProperty is a generic read method to return all of
 * documents that have a property value that matches.
 */
var readAlphaReportByProperty = function(property, value, readCallback){
	if ( (property !== undefined) && (value !== undefined) ) {
		var query = models.alphaReport.find({});
		query.where(property, value);
		query.exec(readCallback);
	}
};

exports.readAlphaReportByProperty = readAlphaReportByProperty;

/**
 * readAlphaReportByObject is a generic read method for alpha_report
 * It will attempt to find an exact match(es) for the object provided.
 * Note: the incoming object can be a subset or superset of the actual object.
 */
var readAlphaReportByObject = function(object, readCallback){
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

exports.readAlphaReportByObject = readAlphaReportByObject;

var readAlphaReports = function(readCallback){
	var query = models.alphaReport.find({});
	query.exec(readCallback);
};

exports.readAlphaReports = readAlphaReports;

/**
 * This updates the alpha report with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
var updateAlphaReport = function(id, data, res){
	updateAlphaReportX(id, data, function(err, val, updated) {
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

exports.updateAlphaReport = updateAlphaReport;


/**
 * updateAlphaReportX calls the validateAlphaReport then updates the object
 * 
 * callback takes the form of  function(err, valid object, AlphaReport object)
 */
var updateAlphaReportX = function(id, data, updCallback) {
	validateAlphaReport(data, function(valid){
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

exports.updateAlphaReportX = updateAlphaReportX;

/**
 * Deletes the alpha report with the given id
 */
var deleteAlphaReport = function(id, res){
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

exports.deleteAlphaReport = deleteAlphaReport;

/**
 * Deletes all reporters
 */
var deleteAlphaReports = function(res){
	models.alphaReport.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};

exports.deleteAlphaReports = deleteAlphaReports;