var revalidator = require('revalidator');

var RawFeed = module.exports = function(models, io, log) {
	var me = this;

	me.logger = log;
	me.models = models;
	me.io = io;

	me.validationModel = me.models.rawFeed.rawFeed;
};

RawFeed.prototype.listFeeds = function(opts, listCallback){
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

/*

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

this.readFeedByProperty = function(property, value, readCallback){
	if ( (property !== undefined) && (value !== undefined) ) {
		var query = models.rawFeed.find({});
		query.where(property, value);
		query.exec(readCallback);
	}
};

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

this.deleteFeeds = function(res){
	models.rawFeed.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};
*/