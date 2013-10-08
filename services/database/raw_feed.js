var revalidator = require('revalidator');
var actionEmitter = require('../action_emitter.js');

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.rawFeedValidation;
	
	me.list = function(config, callback){
		models.rawFeed.find({}, callback);
	};
	
	me.listFields = function(config, fields, callback){
		models.rawFeed.find(config, fields, callback);
	};
	
	me.get = function(id, callback) {
		models.rawFeed.find({_id: id}, callback);
	};
	
	me.getFields = function(id, fields, callback){
		models.rawFeed.find({_id: id}, fields, callback);
	};
	
	me.findWhere = function(config, callback){
		models.rawFeed.find(config, callback);
	};
	
	me.create = function(data, callback) {
		validateRawFeed(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid raw_feed");
				var newFeed = new models.rawFeed(data);
				newFeed.createdDate = new Date();
				newFeed.updatedDate = new Date();
				newFeed.save(function(err){
					if(err){
						me.logger.error('Error saving location', err);
					} else {
						actionEmitter.saveFeedEvent({data: newFeed});
					}
	
					callback(err, valid, newFeed);
				});
			}
			else {
				callback(undefined, valid, data);
			}
		});
	};
	
	me.update = function(id, data, callback) {
		validateRawFeed(data, function(valid){
			if (valid.valid) {
				models.rawFeed.findWhere({_id: id}, function(err, docs){
					if (err) {
						logger.info("Error getting raw_feed "+err);
						callback(err, valid, data);
					} else if (docs) {
						for (var e in data) {
							//Make sure not to change _id
							if (e !== '_id') {
								docs[e] = data[e];
							}
						}
						docs.updatedDate = new Date();
						docs.save(function(err){
							if (err){
								callback(err, valid, data);
							} else {
								callback(err, valid, docs);
							}
						});			
					} else {
						valid.valid = false;
						valid.errors = {expected: id, message: "Raw_feed not found"};
						callback(err, valid, data);
					}
				});
			}
			else {
				callback(undefined, valid, data);
			}
		});
	};
	
	me.del = function(params, callback){
		models.rawFeed.remove(params, callback);
	};
	
	var validateRawFeed = function(data, valCallback) {
		var services = {rawFeed: me};
		// is the JSON semantically valid for the location object?
		var valid = revalidator.validate(data, validationModel);
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
};