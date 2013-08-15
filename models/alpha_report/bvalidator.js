/**
 * alpha_report business validation library
 */
var winston = require('winston');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

var dataLayerAlphaReport = require('../../services/database/alpha_report.js');
var dataLayerRawFeed = require('../../services/database/raw_feed.js');

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
		raw_data_id:	"raw_data_id value is incorrect",
		lang:					"language value is incorrect",
		record:				"There is a record-level error"
	};


	function validateObject(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.raw_data_id;
		rawFeedExists( value, errors, function (err, found) {
			var property = 'raw_data_id';
			if (value !== undefined) {
				if (!found) {
					error(property, value, errors, "RawDataFeed does not exist.");
					logger.info("rawFeedExists " + value + " does not exist.");
				}
			}
			
			value = object.lang;
			languageExists( value, errors, function (err, found) {
				var property = 'lang';
				if (value !== undefined) {
					if (!found) {
						error(property, value, errors, "Language value does not exist.");
						logger.info("languageExists " + value + " does not exist.");
					}
				}
				
				alphaReportExists( object, errors, function (err, found) {
					var property = 'record';
					if (found) {
						error(property, object, errors, "alpha_report already exists.");
						logger.info("alphaReportExists " + JSON.stringify(object));
					}
					
					done();
				});
			});
		});
	}

	/**
	 ** rawFeedExists verifies that, if the raw_feed_id is supplied, the raw_feed document exists.
	 ** Makes an async call to the data service to retrieve a matching raw_feed.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the name was found. 
	**/
	var rawFeedExists = function (value, errors, callback) {
		if (value !== undefined) {
			dataLayerRawFeed.readFeedByProperty('_id', value, function(err, docs) {
				if (err) {
					error('_id', value, errors, 'Error reading raw_feed ' + err);
					logger.info({ error : "Error readRawFeedByPropery " + err });
					callback(err, false);
				} else if (0 !== docs.length) {
					logger.info("raw_feed found for rawFeedExists" + JSON.stringify(docs));
					callback(err, true);
				} else {
					logger.info("raw_feed not found " + value);
					callback(err, false);
				}
			});
		} else {
			callback(null, false);
		}
	};
  
  
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
  
  var alphaReportExists = function(object, errors, callback) {
		
		var searchObject = { source_name : object.source_name, source_id : object.source_id };
		dataLayerAlphaReport.readAlphaReportByObject(searchObject, function(err, locs){
			if (err) {
				error('record', object, errors, 'Error reading alpha_report ' + err);
				logger.info({ error : "Error readAlphaReportByObject " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("alpha_report found for alphaReportExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("alpha_report not found " + JSON.stringify(searchObject));
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