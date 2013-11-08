/**
 * Target Event business validation library
 */
var async = require('async');

module.exports = function(services, logger) {
	var me = this;

	me.validate = function(object, callback) {
		var errors = [];
	
		me.done = function() {
			var bVal = { valid: !(errors.length), errors: errors };
			callback(bVal);
		};

		me.validateObject(object, errors, me.done);
	};

	/**
	 * Default messages to include with validation errors.
	 */
	me.messages = {
		name: "Name value is incorrect",
		description: "Description value is incorrect",
		record: "There is a record-level error",
		assertion: "A target Assertion does not exist"
	};
	
	me.validateObject = function(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the name attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.name;
		me.nameExists(value, errors, function(err, found) {
			var property = 'name';
			if (found) {
				me.error(property, value, errors, "Target Event " + property + " already exists.");
				logger.debug("nameExists " + value);
			}
	
			me.targetEventExists(object, errors, function(err, found) {
				var property = 'record';
				if (found) {
					me.error(property, value, errors, "Target Event already exists.");
					logger.debug("targetEventExists " + JSON.stringify(object));
				}
				
				value = object.assertions;
				me.targetAssertionsExist( value, errors, function (err, found) {
					var property = 'assertions';
					if (!found) {
						me.error(property, value, errors, "Target Assertions are invalid.");
						logger.debug("Target Assertions do not exist " + value);
					}
					
					done();
				});
				
			});
		});
	};

	/**
	 * nameExists verifies the uniqueness of the name in the object.
	 * Makes an async call to the data service to retrieve a matching object.
	 * If found, submits an error to the errors collection.
	 * Returns in the callback any system error and a boolean indicating whether
	 *   or not the name was found. 
	 */
	me.nameExists = function (value, errors, callback) {
		if (value !== undefined) {
			services.targetEventService.findWhere({name: value}, function(err, docs) {
				if (err) {
					me.error('name', value, errors, 'Error reading Target Event name ' + err);
					logger.error({ error : "Error getting targetEventByName " + err });
					callback(err, false);
				} else if (0 !== docs.length) {
					logger.debug("Target Event found for nameExists" + JSON.stringify(docs));
					callback(err, true);
				} else {
					logger.debug("Target Event name not found " + value);
					callback(err, false);
				}
			});
		}
	};
  
	/**
	 * targetEventExists verifies the uniqueness of the entire object.
	 * Makes an async call to the data service to retrieve a matching object
	 *   matching against all object attributes.
	 * If found, submits an error to the errors collection.
	 * Returns in the callback any system error and a boolean indicating whether
	 *   or not the target event was found. 
	 */
	me.targetEventExists = function(object, errors, callback) {
		services.targetEventService.findWhere(object, function(err, docs) {
			if (err) {
				me.error('record', object, errors, 'Error reading Target Event ' + err);
				logger.error({ error : "Error getting Target Event by object " + err });
				callback(err, false);
			} else if (0 !== docs.length) {
				logger.debug("TargetEvent found for targetEventExists" + JSON.stringify(docs));
				callback(err, true);
			} else {
				logger.debug("TargetEvent not found " + JSON.stringify(object));
				callback(err, false);
			}
		});
	};
	/**
	 * targetAssertionExists verifies that the value supplied points to
	 * a valid Target Assertion 
	 * Returns in the callback any system error and a boolean indicating whether
	 * or not the target_assertion_id was found
	 */
	me.targetAssertionsExist = function(values, errors, callback){
		if (typeof(values) === 'undefined' || values.length < 1) {
			callback(undefined, true);
		} else {
			async.each(values, function(assertion, eachCallback){
				services.targetAssertionService.findWhere({_id: assertion}, function(err, docs){
					if ( err ) {
						me.error('assertions', values, errors, 'Error reading Target Assertion ' + err);
						logger.error({ error : "Error getting Target Assertion by ID " + err });
						eachCallback(true);
					} else if ( 0 !== docs.length ) {
						logger.debug("Target Assertion found for targetAssertionExists" + JSON.stringify(docs));
						eachCallback(null);
					} else {
						logger.info("Target Assertion ID not found " + assertion);
						eachCallback(true);
					}
				});
			}, function(err){
				if (err) {
					callback(err, false);
				} else {
					callback(err, true);
				}
			});
		}
	};

	me.error = function(property, actual, errors, msg) {
		var lookup = {
			property : property
		};
	
		var message = msg || me.messages[property] || "no default message";
	
		message = message.replace(/%\{([a-z]+)\}/ig, function(_, match) {
			var msg = lookup[match.toLowerCase()] || "";
			return msg;
		});
		
		errors.push({
			property : property,
			actual : actual,
			message : message
		});
	};
};
