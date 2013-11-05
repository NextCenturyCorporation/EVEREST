/**
 * profile business validation library
 */
var winston = require('winston');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

var dataLayer = require('../../services/database/profile.js');

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
      name:				"Name value is incorrect",
      email:			"Latitude value is incorrect",
      record:			"There is a record-level error"
  };


	function validateObject(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the name attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.name;
		nameExists( value, errors, function (err, found) {
			var property = 'name';
			if (found) {
				error(property, value, errors, "Profile " + property + " already exists.");
				logger.info("nameExists " + value);
			}
	
			profileExists( object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					error(property, value, errors, "Profile already exists.");
					logger.info("profileExists " + JSON.stringify(object));
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
		dataLayer.readProfileByProperty('name', value, function(err, docs) {
			if (err) {
				error('name', value, errors, 'Error reading profile name ' + err);
				logger.info({ error : "Error getting profileByName " + err });
				callback(err, false);
			} else if (0 !== docs.length) {
				logger.info("Profile found for nameExists" + JSON.stringify(docs));
				callback(err, true);
			} else {
				logger.info("Profile name not found " + value);
				callback(err, false);
			}
		});
  };
  
  
	/**
	 ** profileExists verifies the uniqueness of the entire profile object.
	 ** Makes an async call to the data service to retrieve a matching profile
	 **   matching against all object attributes.
	 ** If found, submits an error to the errors collection.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the profile was found. 
	**/
  var profileExists = function(object, errors, callback) {
		dataLayer.findWhere(object, function(err, docs){
			if (err) {
				error('record', object, errors, 'Error reading profile ' + err);
				logger.info({ error : "Error getting profileByObject " + err });
				callback(err, false);
			} else if (0 !== docs.length) {
				logger.info("Profile found for profileExists" + JSON.stringify(docs));
				callback(err, true);
			} else {
				logger.info("Profile not found " + JSON.stringify(object));
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