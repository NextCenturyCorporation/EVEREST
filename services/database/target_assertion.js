var bvalidator = require('../../models/target_assertion/bvalidator.js');
var revalidator = require('revalidator');

module.exports = function(models, io, logger) {
	var me = this;

	var validationModel = models.targetAssertionValidation;

	me.list = function(config, callback) {
		//TODO handle paging
		models.targetAssertion.find({}, callback);
	};

	me.listFields = function(config, fields, callback) {
		models.targetAssertion.find({}, fields, callback);
	};

	me.get = function(id, callback) {
		models.targetAssertion.find({_id: id}, callback);
	};

	me.getFields = function(id, fields, callback) {
		models.targetAssertion.find({_id: id}, fields, callback);
	};

	me.findWhere = function(config, callback) {
		models.targetAssertion.find(config, callback);
	};

	me.create = function(data, callback) {
		validateTargetAssertion(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid target_assertion");
				var newObj = new models.targetAssertion(data);
				newObj.createdDate = new Date();
				newObj.updatedDate = new Date();
				newObj.save(function(err){
					if(err){
						console.log(err);
						logger.error('Error saving target_assertion', err);
					}
					callback(err, valid, newObj);
				});
			}
			else {
				callback(undefined, valid, data);
			}
		});
	};

	me.update = function(id, data, callback) {
		validateTargetAssertion(data, function(valid){
			if (valid.valid) {
				me.findWhere({_id: id}, function(err, docs){
					if(err) {
						logger.info("Error getting target_assertion "+err);
						callback(err, valid, data);
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
								callback(err, valid, data);
							} else {
								callback(err, valid, docs);
							}
						});			
					} else {
						valid.valid = false;
						valid.errors = {expected: id, message: "TargetAssertion not found"};
						callback(err, valid, data);
					}
				});
			}
			else {
				callback(undefined, valid, data);
			}
		});
	};

	me.del = function(config, callback) {
		models.targetAssertion.remove(config, callback);
	};

	/**
	 * validateTargetAssertion validates a target_assertion object against the target_assertion semantic rules
	 * and the business rules associated with a target_assertion
	 *
	 * validateTargetAssertion calls the JSON validation module  revalidator and
	 * calls the business validation module bvalidator for the target_assertion object

	 * data is the target_assertion object being validated
	 * 
	 * valCallback takes the form of  function(valid structure)
	 */
	var validateTargetAssertion = function(data, valCallback) {
		// is the JSON semantically valid for the target_assertion object?
		var valid = revalidator.validate(data, validationModel.targetAssertionValidation);
		if (valid.valid) {
			// does the target_assertion object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		}
		else {
			valCallback(valid);
		}	
	};
};
