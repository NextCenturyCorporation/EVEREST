/**
 * alpha_report business validation library
 */
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
		raw_data_id:	"raw_data_id value is incorrect",
		lang:					"language value is incorrect",
		record:				"There is a record-level error"
	};

	me.validateObject = function(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.raw_data_id;
		me.rawFeedExists( value, errors, function (err, found) {
			var property = 'raw_data_id';
			if (value !== undefined) {
				if (!found) {
					me.error(property, value, errors, "RawDataFeed does not exist.");
					logger.info("rawFeedExists " + value + " does not exist.");
				}
			}
			
			value = object.lang;
			me.languageExists( value, errors, function (err, found) {
				var property = 'lang';
				if (value !== undefined) {
					if (!found) {
						me.error(property, value, errors, "Language value does not exist.");
						logger.info("languageExists " + value + " does not exist.");
					}
				}
				
				me.alphaReportExists( object, errors, function (err, found) {
					var property = 'record';
					if (found) {
						me.error(property, object, errors, "alpha_report already exists.");
						logger.info("alphaReportExists " + JSON.stringify(object));
					}
					
					done();
				});
			});
		});
	};

	/**
	 ** rawFeedExists verifies that, if the raw_feed_id is supplied, the raw_feed document exists.
	 ** Makes an async call to the data service to retrieve a matching raw_feed.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the name was found. 
	**/
	me.rawFeedExists = function (value, errors, callback) {
		if (value !== undefined) {
			services.rawFeedService.readFeedByProperty('_id', value, function(err, docs) {
				if (err) {
					me.error('_id', value, errors, 'Error reading raw_feed ' + err);
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
	me.languageExists = function(value, errors, callback) {
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
  
	me.alphaReportExists = function(object, errors, callback) {
		
		var searchObject = { source_name : object.source_name, source_id : object.source_id };
		services.alphaReportService.readAlphaReportByObject(searchObject, function(err, locs){
			if (err) {
				me.error('record', object, errors, 'Error reading alpha_report ' + err);
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