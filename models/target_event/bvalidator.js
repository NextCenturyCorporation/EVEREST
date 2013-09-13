var async = require('async');

var TargetEvent = require('../../services/database/target_event.js');
var TargetAssertion = require('../../services/database/target_assertion.js');

module.exports = function(models, io, logger) {
	var me = this;

	var targetEvent = new TargetEvent(models, io, logger);
	var targetAssertion = new TargetAssertion(models, io, logger);

	me.validate.messages = {
		name:					"Name value is incorrect",
		description:	"Description value is incorrect",
		record:				"There is a record-level error",
		assertion:		"A target assertion does not exist"
	};

	me.validate = function(object, callback) {
		var errors = [];
	
		function done() {
			var bVal = { valid: !(errors.length), errors: errors };
			callback(bVal);
		}

		me.validateObject(object, errors, done);
	};

	me.validateObject = function(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the name attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.name;
		me.nameExists( value, errors, function (err, found) {
			var property = 'name';
			if (found) {
				me.error(property, value, errors, "TargetEvent " + property + " already exists.");
				logger.info("nameExists " + value);
			}
	
			me.targetEventExists( object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					me.error(property, value, errors, "TargetEvent already exists.");
					logger.info("targetEventExists " + JSON.stringify(object));
				}
				
				value = object.assertions;
				me.targetAssertionsExist( value, errors, function (err, found) {
					var property = 'assertions';
					if (!found) {
						me.error(property, value, errors, "TargetAssertions are invalid.");
						logger.info("targetAssertions do not exist " + value);
					}
					done();
				});
				
			});
		});
	};

	/**
	 ** nameExists verifies the uniqueness of the name in the object.
	 ** Makes an async call to the data service to retrieve a matching object.
	 ** If found, submits an error to the errors collection.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the name was found. 
	**/
	me.nameExists = function (value, errors, callback) {
		me.dataLayerTargetEvent.readTargetEventByProperty('name', value, function(err, locs) {
			if (err) {
				me.error('name', value, errors, 'Error reading targetEvent name ' + err);
				logger.info({ error : "Error getting targetEventByName " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("TargetEvent found for nameExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("TargetEvent name not found " + value);
				callback(err, false);
			}
		});
	};
  
	/**
	 ** targetEventExists verifies the uniqueness of the entire object.
	 ** Makes an async call to the data service to retrieve a matching object
	 **   matching against all object attributes.
	 ** If found, submits an error to the errors collection.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the location was found. 
	**/
	me.targetEventExists = function(object, errors, callback) {
		targetEvent.readTargetEventByObject(object, function(err, locs){
			if (err) {
				me.error('record', object, errors, 'Error reading targetEvent ' + err);
				logger.info({ error : "Error getting targetEventByObject " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("TargetEvent found for targetEventExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("TargetEvent not found " + JSON.stringify(object));
				callback(err, false);
			}
		});
	};
  
	/**
	*	targetAssertionExists verifies that the value supplied points to
	*	a valid target assertion 
	* Returns in the callback any system error and a boolean indicating whether
	*     or not the target_assertion_id was found
	*/
	me.targetAssertionsExist = function(values, errors, callback){
		async.each(values, function(assertion, eachCallback){
			targetAssertion.readTargetAssertionByProperty('_id', assertion, function(err, locs){
				if ( err ) {
					me.error('assertions', values, errors, 'Error reading assertion ' + err);
					logger.info({ error : "Error getting targetAssertionByID " + err });
					eachCallback(true);
				} else if ( 0 !== locs.length ) {
					logger.info("TargetAssertion found for targetAssertionExists" + JSON.stringify(locs));
					eachCallback(null);
				} else {
					logger.info("TargetAssertion id not found " + assertion);
					eachCallback(true);
				}
			});
		}, function(err){
			if ( err ){
				callback(err, false);
			} else {
				callback(err, true);
			}
		});
	};
  

	me.error = function(property, actual, errors, msg) {
	
		var lookup = {
			property : property
		};
	
		var message = msg || me.validate.messages[property] || "no default message";
	
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
