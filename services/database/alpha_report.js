var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');

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
	saveAlphaReport(data, function(err, resultObject){
		if(err){
			logger.error('Error saving alpha report', err);
			general.send500(res);
		} else {
			res.json({id:resultObject._id});
			res.end();
		}
	});
};

exports.createAlphaReport = createAlphaReport;

var saveAlphaReport = function(data, saveCallback){
	var newAlphaReport = new models.alphaReport(data);
	newAlphaReport.save(function(err) {
		saveCallback(err, newAlphaReport);
	});
};

exports.saveAlphaReport = saveAlphaReport;

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

/**
 * This updates the alpha report with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
var updateAlphaReport = function(id, data, res){
	models.alphaReport.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting alpha report "+err);
			general.send500(res);
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
					general.send500(res);
				} else {
					res.json({id:docs._id});
					res.end();
				}
			});
		} else {
			general.send404(res);
		}
	});
};

exports.updateAlphaReport = updateAlphaReport;

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

