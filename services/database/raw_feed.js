/**
 * Runs while connected to a database
 */
var winston = require('winston');
var models = require('../../models/models');
var validationModel = require('../../models/raw_feed/model.js');
var revalidator = require('revalidator');

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
	this.saveFeed(data, function(err, val, newFeed) {
		if(err){
			logger.error('Error saving raw_feed ', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid raw_feed ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Raw_feed saved ' + JSON.stringify(newFeed));
			res.json({id:newFeed._id});
		}
		res.end();
	});
};

/**
 * saveFeed is a "generic" save method callable from both
 * request-response methods and parser-type methods for population of raw_feed data
 * 
 * saveFeed calls the validateFeed module to ensure that the
 * raw_feed data being saved to the database is complete and has integrity.
 * 
 * saveCallback takes the form of  function(err, valid object, raw_feed object)
 * 
 */
this.saveFeed = function(data, saveCallback) {
	this.validateFeed(data, function(valid) {
		if (valid.valid) {
			logger.info("Valid raw_feed");
			var newFeed = new models.rawFeed(data);
			newFeed.createdDate = new Date();
			newFeed.updatedDate = new Date();
			newFeed.save(function(err){
				if(err){
					logger.error('Error saving location', err);
				}
				saveCallback(err, valid, newFeed);
			});
		}
		else {
			saveCallback(undefined, valid, data);
		}
	});
};

/**
 * validateFeed validates a raw_feed object against the raw_feed semantic rules.
 * Currently, there are no business rules associated with a raw_feed
 *
 * validateFeed calls the JSON validation module  revalidator and
 * calls the business validation module bvalidator for the location object

 * data is the location object being validated
 * 
 * valCallback takes the form of  function(valid structure)
 */
this.validateFeed = function(data, valCallback) {
	// is the JSON semantically valid for the location object?
	var valid = revalidator.validate(data, validationModel.rawFeedValidation);
	if (valid.valid) {
		// does the location object comply with business validation logic
		//bvalidator.validate(data, function(valid) {
		//	valCallback(valid);
		//});
		valCallback(valid);
	}
	else {
		valCallback(valid);
	}	
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
	this.updateFeedX(id, data, function(err, val, updFeed) {
		if(err){
			logger.error('Error updating raw_feed', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid raw_feed ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Raw_feed updated ' + JSON.stringify(updFeed));
			res.json({id:updFeed._id});
		}
		res.end();
	});
};

/**
 * updateFeedX is a "generic" update function callable from request-response
 * transactions and callable directly from parser-analysis modules.
 * 
 * updateFeedX calls the validateFeed method then updates the object
 * 
 * callback takes the form of  function(err, valid object, raw_feed object)
 */
this.updateFeedX = function(id, data, updCallback) {
	this.validateFeed(data, function(valid){
		if (valid.valid) {
			models.rawFeed.findById(id, function(err, docs){
				if(err) {
					logger.info("Error getting raw_feed "+err);
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
					valid.errors = {expected: id, message: "Raw_feed not found"};
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
