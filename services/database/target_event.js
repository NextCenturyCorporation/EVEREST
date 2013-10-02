var revalidator = require('revalidator');
var BValidator = require('../../models/target_event/bvalidator.js');
var TargetAssertion = require('../../services/database/target_assertion.js');

module.exports = function(models, io, logger) {
	var me = this;

	me.list = function(params, callback) {
		//TODO paging params
		models.targetEvent.find({}, callback);
	};

	me.listFields = function(paging_params, field_string, callback) {
		models.targetEvent.find({}, field_string, callback);
	};

	/**
	 * saveTargetEvent is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of target_event data
	 * 
	 * saveTargetEvent calls the validateTargetEvent module to ensure that the
	 * target_event data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form of  function(err, valid object, target_event object)
	 */
	me.create = function(data, saveCallback) {
		me.validateTargetEvent(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid target_event");
				var newObj = new models.targetEvent(data);
				newObj.createdDate = new Date();
				newObj.updatedDate = new Date();
				newObj.save(function(err){
					if(err){
						logger.error('Error saving target_event', err);
					}
					saveCallback(err, valid, newObj);
				});
			}
			else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateTargetEvent validates a target_event object against the target_event semantic rules
	 * and the business rules associated with a target_event
	 *
	 * validateTargetEvent calls the JSON validation module  revalidator and
	 * calls the business validation module bvalidator for the target_event object

	 * data is the target_event object being validated
	 * 
	 * valCallback takes the form of  function(valid structure)
	 */
	me.validateTargetEvent = function(data, valCallback) {
		var services = {targetEvent: this, 
			targetAssetion: new TargetAssertion(models, io, logger)};

		var bvalidator = new BValidator(services, logger);

		// is the JSON semantically valid for the target_event object?
		var valid = revalidator.validate(data, models.targetEventValidation);
		if (valid.valid) {
			// does the target_event object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		}
		else {
			valCallback(valid);
		}
	};

	me.get = function(id, callback) {
		me.findWhere({_id: id}, callback);
	};

	me.findWhere = function(config, callback) {
		models.targetEvent.find(config, callback);
	};

	me.update = function(id, data, updCallback) {
		me.validateTargetEvent(data, function(valid){
			if (valid.valid) {
				models.targetEvent.findById(id, function(err, docs){
					if(err) {
						logger.info("Error getting target_event "+err);
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
						valid.errors = {expected: id, message: "TargetEvent not found"};
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
	 * Deletes the target_event with the given ID
	**/
	me.del = function(config, callback) {
		models.targetEvent.remove(config, callback);
	};
};
