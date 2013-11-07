var revalidator = require('revalidator');
var actionEmitter = require('../action_emitter.js');
var paramHandler = require('../list_default_handler.js');
var async = require('async');

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.rawFeedValidation;
	
	/**
	 *	Returns a list of all the Raw Feeds
	 */
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
				
				models.rawFeed.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res){
					callback(err, res, config);
				});
			} else {
				models.rawFeed.find({}, function(err, res){
					callback(err, res, {});
				});
			}
		});
	};
	
	/**
	 *	Returns a list of indexed attributes for Raw Feed
	 */
	me.getIndexes = function(callback){
		var keys = Object.keys(models.rawFeed.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++){
			if (models.rawFeed.schema.paths[keys[i]]._index){
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	/**
	 *	Returns a sorted list containing _id and createdDate for all Raw Feeds
	 */
	me.findDates = function(callback) {
		models.rawFeed.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get feed Dates: " + err);
			if (err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err, results) {
					if(err) {
						callback(errorMsg);
					} else {
						callback(results);
					}
				});
			}
		});
	};

	/**
	 *	Returns the Date version of parameter string.createDate
	 */
	me.flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};

	/**
	 *	Returns the number of Raw Feeds that fit the parameter config
	 */
	me.getTotalCount = function(config, callback){
		models.rawFeed.count(config, callback);
	};
	
	/**
	 *
	 */
	me.listFields = function(params, field_string, callback){
		models.rawFeed.find(params, field_string, callback);
	};
	
	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Raw Feed data
	 * 
	 * saveRawFeed calls the validateRawFeed module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Raw Feed object)
	 */
	me.create = function(data, callback) {
		me.validateRawFeed(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid raw_feed");
				var newFeed = new models.rawFeed(data);
				//newFeed.createdDate = new Date();
				//newFeed.updatedDate = new Date();
				newFeed.save(function(err){
					if (err){
						logger.error('Error saving raw feed', err);
					} else {
						actionEmitter.saveFeedEvent(newFeed);
						//actionEmitter.saveFeedEvent({data: newFeed});
					}
	
					callback(err, valid, newFeed);
				});
			} else {
				callback(undefined, valid, data);
			}
		});
	};
	
	/**
	 * validateRawFeed validates an Alpha Report object against the Raw Feed
	 * semantic rules and the business rules associated with an RawFeed
	 *
	 * validateRawFeed calls the JSON validation module revalidator
	 *
	 * data is the object being validated
	 * 
	 * valCallback takes the form function(valid structure)
	 */
	me.validateRawFeed = function(data, valCallback) {
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
	
	/**
	 * Returns the Raw Feed object with id specified in URL
	 */
	me.get = function(id, callback) {
		me.findWhere({_id: id}, callback);
	};
	
	/**
	 * generic read method to return all documents that have a matching
	 * set of key, value pairs specified by config
	 * 
	 * callback takes the form function(err, docs)
	 */
	me.findWhere = function(config, callback){
		models.rawFeed.find(config, callback);
	};
	
	/**
	 * update calls validateRawFeed then updates the object
	 *
	 * callback takes the form function(err, valid object, Raw Feed object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Raw Feed", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //Since me.get will always return an array of size 1
				for (var e in data) {
					//Make sure not to change _id
					if (e !== '_id') {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validateRawFeed(data, function(valid) {
					if (valid.valid) {
						docs.save(function(err) {
							if (err) {
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});	
					} else {
						valid.valid = false;
						valid.errors = {expected: id, message: "Updated Raw Feed information not valid"};
						updCallback(err, valid, data);
					}
				});		
			} else {
				var errorMsg = new Error("Could not find Raw Feed to update.");
				updCallback(errorMsg, null, data);
			}
		});
	};
	
	me.del = function(params, callback){
		models.rawFeed.remove(params, callback);
	};
};