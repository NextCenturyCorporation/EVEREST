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
this.listAlphaReports = function(res){
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
this.listAlphaReportSourceIds = function(res){
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
this.createAlphaReport = function(data, res){
	this.saveAlphaReport(data, function(err, resultObject){
		if(err){
			logger.error('Error saving alpha report', err);
			general.send500(res);
		} else {
			res.json({id:resultObject._id});
			res.end();
		}
	});
};

this.saveAlphaReport = function(data, saveCallback){
	var newAlphaReport = new models.alphaReport(data);
	newAlphaReport.save(function(err) {
		saveCallback(err, newAlphaReport);
	});
};

/**
 * Returns the alpha report object with id specified in URL
 */
this.getAlphaReport = function(id, res){
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

this.getAlphaReportBySource = function(source, res){
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

this.getAlphaReportBySourceId = function(source_id, res){
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
 * This updates the alpha report with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
this.updateAlphaReport = function(id, data, res){
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

/**
 * Deletes the alpha report with the given id
 */
this.deleteAlphaReport = function(id, res){
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
this.deleteAlphaReports = function(res){
	models.alphaReport.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};