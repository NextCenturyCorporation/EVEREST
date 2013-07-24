/**
 * Runs while connected to a database
 */
var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * Returns a list of all raw feeds
**/
this.listFeeds = function(opts, res){
	models.rawFeed.find({}, function(err, docs){
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

/**
 * Creates a new raw_feed from the data POSTed
 * See the schema in raw_feed/model.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
**/
this.createFeed = function(data, res){
	var newFeed = new models.rawFeed(data);
	newFeed.save(function(err){
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

/**
 * Returns the raw_feed with the id specified in the URL
**/
this.getFeedRequest = function(id, opts, res){
	this.getFeed(id, function(err, docs){
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

this.getFeed = function(id, callback) {
	models.rawFeed.findById(id, callback);
};

/**
 * readFeedByProperty is a generic read function for returning
 * all of the matching documents whose property-value pair matches
 * the the search property value.
 */
this.readFeedByProperty = function(property, value, readCallback){
	if ( (property !== undefined) && (value !== undefined) ) {
		var query = models.rawFeed.find({});
		query.where(property, value);
		query.exec(readCallback);
	}
};


/**
 * This updates the raw_feed with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
**/
this.updateFeed = function(id, data, res){
	models.rawFeed.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting raw feed "+err);
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
 * Deletes the raw_feed with the given ID
**/
this.deleteFeed = function(id, data, res){
	models.rawFeed.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting raw feed ' + id, err);
			res.status('500');
			res.json({error: 'Invalid raw feed ' + id});
			res.end();
		} else {
			for(var i = 0; i < docs.length; i++){
				docs[i].remove();
			}
			res.json({status:'ok'});
			res.end();
		}//;
	});
};

/**
 * Deletes all raw_feeds
**/
this.deleteFeeds = function(res){
	models.rawFeed.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};
