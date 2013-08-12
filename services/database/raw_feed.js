var revalidator = require('revalidator');

var RawFeed = module.exports = function(models, io, log) {
	var me = this;

	me.logger = log;
	me.models = models;
	me.io = io;

	me.validationModel = me.models.rawFeed.rawFeed;
};

RawFeed.prototype.list = function(opts, listCallback){
	var me = this;

	me.models.rawFeed.find({}, listCallback);
};

RawFeed.prototype.get = function(id, callback) {
	var me = this;
	
	me.models.rawFeed.findById(id, callback);
};

RawFeed.prototype.create = function(data, saveCallback) {
	var me = this;
	
	me.validateFeed(data, function(valid) {
		if (valid.valid) {
			logger.info("Valid raw_feed");
			var newFeed = new me.models.rawFeed(data);
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

RawFeed.prototype.validateFeed = function(data, valCallback) {
	var me = this;
	
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

RawFeed.prototype.readFeedByProperty = function(property, value, readCallback){
	var me = this;
	
	if ( (property !== undefined) && (value !== undefined) ) {
		var query = me.models.rawFeed.find({});
		query.where(property, value);
		query.exec(readCallback);
	}
};

RawFeed.prototype.update = function(id, data, updCallback) {
	var me = this;
	
	this.validateFeed(data, function(valid){
		if (valid.valid) {
			me.models.rawFeed.findById(id, function(err, docs){
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

RawFeed.prototype.delete = function(params, deleteCallback){
	var me = this;
	
	me.models.rawFeed.remove(params, deleteCallback);
};
