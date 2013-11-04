var winston = require('winston');
var general = require('../general_response');
var models = require('../../models/models');
var validationModel = require('../../models/reporter/model.js');
var bvalidator = require('../../models/reporter/bvalidator.js');
var revalidator = require('revalidator');

//Load and set up the Logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file
	transports: [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})]
});

var isObjectEmpty = function(obj) {
    return Object.keys(obj).length === 0;
};

/**
 *	Returns a list of all the reporters
 */
this.listReporters = function(res){
	models.reporter.find({}, function(err, docs){
		if(err){
			logger.info("Error listing reporters " + err);
			general.send500(res);
		} else { 
			res.json(docs);
			res.end();
		}
	});
};

/**
 *	Returns a list of all the reporters by id and name
 */
this.listReporterNames = function(res){
	models.reporter.find({}, '_id name', function(err, docs){
		if(err){
			logger.info("Error listing reporter id - name" + err);
			general.send500(res);
		} else { 
			res.json(docs);
			res.end();
		}
	});
};

/**
 * Creates a new reporter object based on the data POSTed.
 * See the Reporter schema for details on what to post.
 * All validation is handled through the schema.
 *
 * On success, it returns the new id 
 */
this.createReporter = function(data, res){
	this.saveReporter(data, function(err, val, newReporter) {
		if(err){
			logger.error('Error saving reporter ', err);
			general.send500(res,"Error saving reporter");
		} else if (isObjectEmpty(data) || !val.valid) {
			logger.info('Invalid reporter ' + JSON.stringify(val.errors));
			general.send500(res, "Invalid Reporter");
		} else {
			logger.info('Reporter saved ' + JSON.stringify(newReporter));
			res.json({_id:newReporter._id});
			res.end();
		}
		
	});
};

/**
 * saveReporter is a "generic" save method callable from both
 * request-response methods and parser-type methods for population of reporter data
 * 
 * saveReporter calls the validateReporter module to ensure that the
 * data being saved to the database is complete and has integrity.
 * 
 * saveCallback takes the form of  function(err, valid object, reporter object)
 */
this.saveReporter = function(data, saveCallback) {
	this.validateReporter(data, function(valid) {
		if (valid.valid) {
			logger.info("Valid reporter");
			var newReporter = new models.reporter(data);
			newReporter.createdDate = new Date();
			newReporter.updatedDate = new Date();
			newReporter.save(function(err){
				if(err){
					logger.error('Error saving reporter ', err);
				}
				saveCallback(err, valid, newReporter);
			});
		}
		else {
			saveCallback(undefined, valid, data);
		}
	});
};

/**
 * validateReporter validates a reporter object against the reporter semantic rules
 * and the business rules associated with a reporter object
 *
 * validateReporter calls the JSON validation module  revalidator and
 * calls the business validation module bvalidator for the reporter object

 * data is the object being validated
 * 
 * valCallback takes the form of  function(valid structure)
 */
this.validateReporter = function(data, valCallback) {
	// is the JSON semantically valid for the object?
	var valid = revalidator.validate(data, validationModel.reporterValidation);
	if (valid.valid) {
		// does the object comply with business validation logic
		bvalidator.validate(data, function(valid) {
			valCallback(valid);
		});
	}
	else {
		valCallback(valid);
	}	
};

/**
 * Returns the reporter object with id specified in URL
 */
this.getReporter = function(id, res){
	models.reporter.findById(id, function(err, docs){
		if(err) {
			logger.info('Error getting reporter ' + err);
			general.send500(res);
		} else if(docs) {
			res.json(docs);
			res.end();
		} else {
			general.send404(res);
		}
	});
};

this.getReporterBySource = function(source, res){
	models.reporter.find({"source_name":source}, function(err, docs){
		if(err){
			logger.info('Error getting reporter ' + err);
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
 * readReporterByProperty is a generic read method to return all of
 * documents that have a property value that matches.
 */
this.readReporterByProperty = function(property, value, readCallback){
	if ( (property !== undefined) && (value !== undefined) ) {
		var query = models.reporter.find({});
		query.where(property, value);
		query.exec(readCallback);
	}
};

/**
 * readReporterByObject is a generic read method
 * It will attempt to find an exact match(es) for the object provided.
 * Note: the incoming object can be a subset or superset of the actual object.
 */
this.readReporterByObject = function(object, readCallback){
	if ( object !== undefined ) {
		var query = models.reporter.find({});
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				query.where(key, object[key]);
			}
		}
		query.exec(readCallback);
	}
};

/**
 * This updates the reporter with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
this.updateReporter = function(id, data, res){
	this.updateReporterX(id, data, function(err, val, updLoc) {
		if(err){
			logger.error('Error updating Reporter', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid Reporter ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Reporter updated ' + JSON.stringify(updLoc));
			res.json({id:updLoc._id});
		}
		res.end();
	});
};


/**
 * updateReporterX calls the validateReporter then updates the object
 * 
 * callback takes the form of  function(err, valid object, Reporter object)
 */
this.updateReporterX = function(id, data, updCallback) {
	this.validateReporter(data, function(valid){
		if (valid.valid) {
			models.reporter.findById(id, function(err, docs){
				if(err) {
					logger.info("Error getting Reporter "+err);
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
					valid.errors = {expected: id, message: "Reporter not found"};
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
 * Deletes the reporter with the given id
 */
this.deleteReporter = function(id, res){
	models.reporter.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting reporter', err);
			res.status('500');
			res.json({error: 'Invalid reporter ' + id});
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
this.deleteReporters = function(res){
	models.reporter.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};