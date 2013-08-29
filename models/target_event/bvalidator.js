/**
 * location business validation library
 */
var winston = require('winston');
var async = require('async');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

var dataLayerTargetEvent = require('../../services/database/target_event.js');
var dataLayerTargetAssertion = require('../../services/database/target_assertion.js');

(function (exports) {
	exports.validate = validate;

	function validate(object, callback) {
		var errors = [];
	
		function done() {
			var bVal = { valid: !(errors.length), errors: errors };
			callback(bVal);
		}

		validateObject(object, errors, done);
	}

	/**
	 * Default messages to include with validation errors.
	 */
	validate.messages = {
		name:					"Name value is incorrect",
		description:	"Description value is incorrect",
		record:				"There is a record-level error",
		assertion:		"A target assertion does not exist"
	};

	function validateObject(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the name attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.name;
		nameExists( value, errors, function (err, found) {
			var property = 'name';
			if (found) {
				error(property, value, errors, "TargetEvent " + property + " already exists.");
				logger.info("nameExists " + value);
			}
	
			targetEventExists( object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					error(property, value, errors, "TargetEvent already exists.");
					logger.info("targetEventExists " + JSON.stringify(object));
				}
				
				value = object.assertions;
				targetAssertionsExist( value, errors, function (err, found) {
					var property = 'assertions';
					if (!found) {
						error(property, value, errors, "TargetAssertions are invalid.");
						logger.info("targetAssertions do not exist " + value);
					}
					done();
				});
				
			});
		});
	}

	/**
	 ** nameExists verifies the uniqueness of the name in the object.
	 ** Makes an async call to the data service to retrieve a matching object.
	 ** If found, submits an error to the errors collection.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the name was found. 
	**/
	var nameExists = function (value, errors, callback) {
		dataLayerTargetEvent.readTargetEventByProperty('name', value, function(err, locs) {
			if (err) {
				error('name', value, errors, 'Error reading targetEvent name ' + err);
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
	var targetEventExists = function(object, errors, callback) {
		dataLayerTargetEvent.readTargetEventByObject(object, function(err, locs){
			if (err) {
				error('record', object, errors, 'Error reading targetEvent ' + err);
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
	var targetAssertionsExist = function(values, errors, callback){
		async.each(values, function(assertion, eachCallback){
			dataLayerTargetAssertion.readTargetAssertionByProperty('_id', assertion, function(err, locs){
				if ( err ) {
					error('assertions', values, errors, 'Error reading assertion ' + err);
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
  

	function error(property, actual, errors, msg) {
	
		var lookup = {
			property : property
		};
	
		var message = msg || validate.messages[property] || "no default message";
	
		message = message.replace(/%\{([a-z]+)\}/ig, function(_, match) {
			var msg = lookup[match.toLowerCase()] || "";
			return msg;
		});
		errors.push({
			property : property,
			actual : actual,
			message : message
		});
	}

})(typeof(window) === 'undefined' ? module.exports : (window.json = window.json || {}));