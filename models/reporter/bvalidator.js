/**
 * Reporter business validation library
 */
module.exports = function(services, logger) {
	var me = this;
	
	me.validate = function(object, callback) {
		var errors = [];
		
		me.done = function() {
			var bVal = {valid: !(errors.length), errors: errors};
			callback(bVal);
		};
		
		me.validateObject(object, errors, me.done);
	};
	
	/**
	 * Default messages to include with validation errors.
	 */
	me.messages = {
		lang: "language value is incorrect",
		record:	"There is a record-level error"
	};
	
	me.validateObject = function(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.lang;
		me.languageExists(value, errors, function (err, found) {
			var property = 'lang';
			if (value !== undefined) {
				if (!found) {
					me.error(property, value, errors, "Language value does not exist.");
					logger.info("languageExists " + value + " does not exist.");
				}
			}
			
			me.reporterExists(object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					me.error(property, object, errors, "Reporter already exists.");
					logger.info("reportertExists " + JSON.stringify(object));
				}
				
				done();
			});
		});
	};
	
	/**
	 * languageExists verifies the value of the language attribute
	 * Makes an async call to the data service to retrieve a matching language 
	 * Returns in the callback any system error and a boolean indicating whether
	 *   or not the place was found. 
	 */
	me.languageExists = function(value, errors, callback) {
		callback(null, true);
//		dataLayer.readPlaceByObject(object, function(err, locs){
//			if (err) {
//				error('record', object, errors, 'Error reading place ' + err);
//				logger.info({ error : "Error getting placeByObject " + err });
//				callback(err, false);
//			} else if (0 !== locs.length) {
//				logger.info("Place found for placeExists" + JSON.stringify(locs));
//				callback(err, true);
//			} else {
//				logger.info("Place not found " + JSON.stringify(object));
//				callback(err, false);
//			}
//		});
	};
  
	me.reporterExists = function(object, errors, callback) {
		var searchObject = {source_name: object.source_name, name: object.name};
		services.reporterService.findWhere(searchObject, function(err, docs){
			if (err) {
				me.error('record', object, errors, 'Error reading Reporter ' + err);
				logger.info({ error : "Error readReporterByObject " + err });
				callback(err, false);
			} else if (0 !== docs.length) {
				logger.info("Reporter found for reporterExists" + JSON.stringify(docs));
				callback(err, true);
			} else {
				logger.info("Reporter not found " + JSON.stringify(searchObject));
				callback(err, false);
			}
		});
	};
  
  
	me.error = function(property, actual, errors, msg) {
		var lookup = {
			property: property
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