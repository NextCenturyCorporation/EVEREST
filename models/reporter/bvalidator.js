/**
 * reporter business validation library
 */
var winston = require('winston');
var dataLayerReporter = require('../../services/database/reporter.js');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});


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
		lang:					"language value is incorrect",
		record:				"There is a record-level error"
	};


	function validateObject(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.lang;
		languageExists( value, errors, function (err, found) {
			var property = 'lang';
			if (value !== undefined) {
				if (!found) {
					error(property, value, errors, "Language value does not exist.");
					logger.info("languageExists " + value + " does not exist.");
				}
			}
			
			reporterExists( object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					error(property, object, errors, "reporter already exists.");
					logger.info("reportertExists " + JSON.stringify(object));
				}
				
				done();
			});
		});
	}

  
	/**
	 ** languageExists verifies the value of the language attribute
	 ** Makes an async call to the data service to retrieve a matching language 
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the location was found. 
	**/
	var languageExists = function(value, errors, callback) {
		callback(null, true);
//		dataLayer.readLocationByObject(object, function(err, locs){
//			if (err) {
//				error('record', object, errors, 'Error reading location ' + err);
//				logger.info({ error : "Error getting locationByObject " + err });
//				callback(err, false);
//			} else if (0 !== locs.length) {
//				logger.info("Location found for locationExists" + JSON.stringify(locs));
//				callback(err, true);
//			} else {
//				logger.info("Location not found " + JSON.stringify(object));
//				callback(err, false);
//			}
//		});
  };
  
  var reporterExists = function(object, errors, callback) {
		
		var searchObject = { source_name : object.source_name, source_id : object.source_id };
		dataLayerReporter.readReporterByObject(searchObject, function(err, locs){
			if (err) {
				error('record', object, errors, 'Error reading reporter ' + err);
				logger.info({ error : "Error readReporterByObject " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("reporter found for reporterExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("reporter not found " + JSON.stringify(searchObject));
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