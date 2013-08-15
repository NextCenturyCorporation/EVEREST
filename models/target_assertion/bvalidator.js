/**
 * location business validation library
 */
var winston = require('winston');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

var dataLayer = require('../../services/database/target_assertion.js');

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
      record:				"There is a record-level error"
  };


	function validateObject(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the name attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.name;
		nameExists( value, errors, function (err, found) {
			var property = 'name';
			if (found) {
				error(property, value, errors, "Location " + property + " already exists.");
				logger.info("nameExists " + value);
			}
	
			targetAssertionExists( object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					error(property, value, errors, "TargetAssertion already exists.");
					logger.info("targetAssertionExists " + JSON.stringify(object));
				}
				done();
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
		dataLayer.readTargetAssertionByProperty('name', value, function(err, locs) {
			if (err) {
				error('name', value, errors, 'Error reading targetAssertion name ' + err);
				logger.info({ error : "Error getting targetAssertionByName " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("TargetAssertion found for nameExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("TargetAssertion name not found " + value);
				callback(err, false);
			}
		});
  };
  
  
	/**
	 ** targetAssertionExists verifies the uniqueness of the entire object.
	 ** Makes an async call to the data service to retrieve a matching object
	 **   matching against all object attributes.
	 ** If found, submits an error to the errors collection.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the location was found. 
	**/
  var targetAssertionExists = function(object, errors, callback) {
		dataLayer.readTargetAssertionByObject(object, function(err, locs){
			if (err) {
				error('record', object, errors, 'Error reading targetAssertion ' + err);
				logger.info({ error : "Error getting targetAssertionByObject " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("TargetAssertion found for targetAssertionExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("TargetAssertion not found " + JSON.stringify(object));
				callback(err, false);
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