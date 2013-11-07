/**
 * Runs while connected to a database
 */
var Bvalidator = require('../../models/place/bvalidator.js');
var revalidator = require('revalidator');
var paramHandler = require('../list_default_handler');
var async = require('async');

module.exports = function(models, io, logger){
	var me = this;
	
	var validationModel = models.placeValidation;
	
	var services = {
		placeService: me
	};
	
	var bvalidator = new Bvalidator(services, logger);
	
	me.list = function(req, callback){
		paramHandler.handleDefaultParams(req, function(params){
			if (params !== null){
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;
				
				var config = {
					createdDate: {
						$gte: params.start,
						$lte: params.end
					}
				};
					
				//TODO put config back into find?			
				models.place.find({}).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res){
					callback(err, res, config);
				});
			} else {
				models.place.find({}, function(err, res){
					callback(err, res, {});
				});
			}
		});
	};
	
	me.getIndexes = function(req, callback){
		var keys = Object.keys(models.place.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++){
			if (models.place.schema.paths[keys[i]]._index){
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};

	me.findDates = function(callback){
		models.place.find({}, {_id: 0, createdDate: 1}, function(err, dates){
			var errorMsg = new Error("could not get place Dates: " + err);
			if (err){
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err, res){
					if (err){
						callback(errorMsg);
					} else {
						callback(res);
					}
				});
			}
		});
	};
	
	me.flattenArray = function(string, callback){
		callback(null, Date.parse(string.createdDate));
	};
	
	me.getTotalCount = function(config, callback){
		models.place.count(config, callback);
	};
	
	me.listFields = function(params, field_string, callback){
		models.place.find(params, field_string, callback);
	};
	
	/**
	 * Creates a new place from the data POSTed
	 * See the Place schema in models.js for details on the data to post.
	 * All validation is handled though the schema.
	 *
	 * On success, it returns id:<ID-hash>
	 */
	me.create = function(data, saveCallback){
		//data.latitude = parseFloat(data.latitude);
		//data.longitude = parseFloat(data.longitude);
		//data.radius = parseFloat(data.radius);
		
		me.validatePlace(data, function(valid){
			if (valid.valid){
				logger.info("Valid Place");
				var newPlace = new models.place(data);
				newPlace.save(function(err){
					if (err){
						logger.error('Error saving Place ', err);
					} else {
						//action emit save place event if necessary?
					}
					saveCallback(err, valid, newPlace);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};
	
	/**
	 * validatePlace validates a place object against the place semantic rules
	 * and the business rules associated with a place
	 *
	 * validatePlace calls the JSON validation module  revalidator and
	 * calls the business validation module bvalidator for the place object
	
	 * data is the place object being validated
	 * 
	 * valCallback takes the form of function(valid structure)
	 */
	me.validatePlace = function(data, valCallback){
		// is the JSON semantically valid for the place object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid){
			//does the place object comply with business validation logic
			bvalidator.validate(data, function(valid){
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};
	
	me.get = function(id, callback){
		me.findWhere({_id: id}, callback);
	};
	
	me.findWhere = function(config, callback){
		models.place.find(config, callback);
	};
	
	me.update = function(id, data, updCallback){
		me.get(id, function(err, docs){
			if (err){
				logger.info('Error getting Place ' + err);
				updCallback(err, null, data);
			} else if (docs) {
				docs = docs[0]; //There will only be one place from the get
				for (var e in data){
					if (e !== '_id'){
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validatePlace(docs, function(valid){
					if (valid.valid){
						docs.save(function(err){
							if (err){
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});
					} else {
						valid.valid = false;
						valid.errors = {expected: id, message: "Updated Place information is not valid."};
						updCallback(err, valid, data);
					}
				});
			} else {
				var errorMsg = new Error('Could not find Place to update');
				updCallback(errorMsg, null, data);
			}
		});
	};
	
	me.del = function(config, callback){
		models.place.remove(config, callback);
	};
};