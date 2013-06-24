/**
 * Runs while connected to a database
 */

/*global require */
// require is a global node function/keyword

var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

this.listFeeds = function(opts, res){
	models.rawFeed.find({},'_id timestamp text feedSource', function(err, docs){
		if(err){
			logger.info("Error listing raw feeds "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

this.createFeed = function(data, res, io, gcm){
	this.saveFeed(data, function(err, newfeed){
		if(err){
			logger.error('Error saving raw feed', err);
			general.send500(res);
		} else {
			res.json({id:newFeed._id});
			res.end();
		}
	});
};

this.saveFeed = function(data, saveCallback) {
	var newFeed = new models.rawFeed(data);
	newFeed.save(saveCallback);
};

this.getFeed = function(id, opts, res){
	models.rawFeed.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting raw feed "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(docs) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};

this.updateFeed = function(id, data, res){
	models.rawFeed.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting raw feed "+err);
			general.send500(res);
		} else if(docs) {
			for(var e in data){
				//Make sure not to change _id
				if(e != '_id'){
					docs[e] = data[e];
				}
			}
			docs.save(function(err){
				if(err){
					general.send500(res);
				} else {
					res.end({status:'ok'});
					res.end();
				}
			});
		} else {
			general.send404(res);
		}
	});
};

this.deleteFeed = function(id, res){
	models.rawFeed.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting raw feed', err);
			general.send500(res);
		} else {
			for(var i = 0; i < docs.length; i++){
				docs[i].remove();
			}
			res.json({status:'ok'});
			res.end();
		}//;
	});
};
