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
	this.saveReporter(data, function(err, newReporter){
		if(err){
			logger.error('Error saving reporter', err);
			general.send500(res);
		} else {
			res.json({id:newReporter._id});
			res.end();
		}
	});
};

this.saveReporter = function(data, saveCallback){
	var newReporter = new models.reporter(data);
	
	newReporter.createdDate = new Date();
	newReporter.updatedDate = new Date();
	
	newReporter.save(function(err) {
		saveCallback(err, newReporter);
	});
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
 * This updates the reporter with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
this.updateReporter = function(id, data, res){
	models.reporter.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting reporter "+err);
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