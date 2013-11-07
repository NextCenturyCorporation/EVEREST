var revalidator = require('revalidator');
var actionEmitter = require('../action_emitter.js');
var paramHandler = require('../list_default_handler.js');
var async = require('async');

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.rawFeedValidation;
	
	me.list = function(req, callback){

		paramHandler.handleDefaultParams(req, function(params){
			if (params !== null){
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;
				
				var config = {
					createdDate :{
						$gte: params.start,
						$lte: params.end
					}
				};
				
				models.rawFeed.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(error, response){
					callback(error, response, config);
				});
			} else {
				models.rawFeed.find({}, function(error, response){
					callback(error, response, {});
				});
			}
		});
	};
	
	//temporary way to get database indexes for sorting
	me.getIndexes = function(req, callback){
		var keys = Object.keys(models.rawFeed.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++){
			if (models.rawFeed.schema.paths[keys[i]]._index){
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	me.getTotalCount = function(config, callback){
		models.rawFeed.count(config, callback);
	};
	
	me.get = function(id, callback) {
		me.findWhere({_id: id}, callback);
	};
	
	me.getFields = function(id, fields, callback){
		me.findWhereFields({_id: id}, fields, callback);
	};
	
	me.findWhere = function(config, callback){
		models.rawFeed.find(config, callback);
	};

	me.findDates = function(callback) {
		models.rawFeed.find({},{_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get feed Dates: " + err);
			if(err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err,results) {
					if(err) {
						callback(errorMsg);
					} else {
						callback(results);
					}
				});
			}
		});
	};

	me.flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};


	me.findWhereFields = function(config, fields, callback){
		models.rawFeed.find(config, fields, callback);
	};
	
	me.create = function(data, callback) {
		me.validateRawFeed(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid raw_feed");
				var newFeed = new models.rawFeed(data);
				newFeed.createdDate = new Date();
				newFeed.updatedDate = new Date();
				newFeed.save(function(err){
					if(err){
						me.logger.error('Error saving raw feed', err);
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
	
	me.validateRawFeed = function(data, valCallback) {
		var services = {rawFeed: me};
		// is the JSON semantically valid for the raw feed object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the raw feed object comply with business validation logic
			//bvalidator.validate(data, function(valid) {
			//	valCallback(valid);
			//});
			valCallback(valid);
		} else {
			valCallback(valid);
		}	
	};
	
	me.update = function(id, data, callback) {
		me.validateRawFeed(data, function(valid){
			if (valid.valid) {
				me.get(id, function(err, docs){
					if (err) {
						logger.info("Error getting raw_feed "+err);
						callback(err, valid, data);
					} else if (docs) {
						docs = docs[0]; //Since me.get will always return an array of size 1;
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
	
	me.validateRawFeed = function(data, valCallback) {
		var services = {rawFeed: me};
		// is the JSON semantically valid for the raw feed object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the raw feed object comply with business validation logic
			//bvalidator.validate(data, function(valid) {
			//	valCallback(valid);
			//});
			valCallback(valid);
		} else {
			valCallback(valid);
		}	
	};
};