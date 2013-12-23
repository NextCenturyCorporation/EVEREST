var revalidator = require("revalidator");
var AlphaReportService = require("./alpha_report");
var actionEmitter = require("../action_emitter.js");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.tagValidation;

	/**
	 * Returns a list of all Tags
	 */
	me.list = function(req, callback) {
		paramHandler.handleDefaultParams(req, function(params) {
			if (params !== null) {
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;
				
				models.tag.find({}).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, {});
				});
			} else {
				models.tag.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};

	/**
	 *	Returns a list of indexed attributes for Tag
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.tag.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.tag.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	/**
	*	Returns a list of date attributes for Tag
	*/
	me.getDateTypes = function(callback) {
		var keys = Object.keys(models.tag.schema.paths);
		var dateTypes = [];
		for (var i = 0; i < keys.length; i++) {
			if (models.tag.schema.tree[keys[i]].type === Date) {
				dateTypes.push(keys[i].toString());
			}
		}
	
		callback(dateTypes);
	};

	/**
	 *	Returns a sorted list containing _id and createdDate for all Tags
	 */
	me.findDates = function(callback) {
		models.tag.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Tag Dates: " + err);
			if (err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err, results) {
					if (err) {
						callback(errorMsg);
					} else {
						callback(results);
					}
				});
			}
		});
	};

	/**
	 *	Returns the Date version of parameter string.createdDate
	 */
	me.flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};
	
	/**
	 *	Returns the number of Tags that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.tag.count(config, callback);
	};

	/**
	 * Returns only the fields specified in field_string for each Tag
	 */
	me.listFields = function(params, field_string, callback) {
		models.tag.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population 
	 * of Tag data
	 * 
	 * create calls the validateTag module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Tag object)
	 */
	me.create = function(data, saveCallback) {
		me.validateTag(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Tag");
				
				var newTag = new models.tag(data);
				newTag.save(function(err) {
					if (err) {
						logger.error("Error saving Tag ", err);
					} 

					saveCallback(err, valid, newTag);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateTag validates an Tag object against the Tag
	 * semantic rules and the business rules associated with an Tag
	 *
	 * validateTag calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the Tag object

	 * data is the object being validated
	 * 
	 * valCallback takes the form function(valid structure)
	 */
	me.validateTag = function(data, valCallback) {
		// is the JSON semantically valid for the Tag object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Tag object comply with business validation logic
			//bvalidator.validate(data, function(valid) {
				valCallback(valid);
			//});
		} else {
			valCallback(valid);
		}
	};

	/**
	 * Returns the Tag object with the specified id
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
	me.findWhere = function(config, callback) {
		models.tag.find(config, callback);
	};

	/**
	 * update gets the Tag by the specified id then calls validateTag
	 *
	 * callback takes the form function(err, valid object, Tag object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Tag", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Tag from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validateTag(docs, function(valid) {
					if (valid.valid) {
						docs.save(function(err) {
							if (err) {
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});
					} else {
						//valid.valid = false;
						//valid.errors = {expected: id, message: "Updated Tag information not valid"};
						updCallback(err, valid, data);
					}
				});
			} else {
				var errorMSG = new Error("Could not find Tag to update");
				updCallback(errorMSG, null, data);
			}
		});
	};

	/**
	 * Remove all Tags that match the parameter config
	 */
	me.del = function(config, callback) {
		models.tag.remove(config, callback);
	};
};