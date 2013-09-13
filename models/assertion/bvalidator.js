module.exports = function(services, logger) {
	var me = this;

	me.validate = function(object, callback) {
		var errors = [];
	
		function done() {
			var bVal = { valid: !(errors.length), errors: errors };
			callback(bVal);
		}

		me.validateObject(object, errors, done);
	};

	/**
	 * Default messages to include with validation errors.
	 */
	me.messages = {
		alpha_report_id:	"alpha_report_id value is incorrect",
		reporter_id:			"reporter_id value is incorrect",
		record:						"There is a record-level error"
	};


	me.validateObject = function(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.alpha_report_id;
		me.alphaReportExists( value, errors, function (err, found) {
			var property = 'alpha_report_id';
			if (value !== undefined) {
				if (!found) {
					me.error(property, value, errors, "Alpha Report does not exist.");
					logger.info("alphaReportExists " + value + " does not exist.");
				}
			} else {
				me.error(property, value, errors, "alphaReportExists  undefined property value.");
				logger.info("alphaReportExists " + property + ":" + value + " does not exist.");
			}
			
			value = object.reporter_id;
			me.reporterExists( value, errors, function (err, found) {
				var property = 'reporter_id';
				if (value !== undefined) {
					if (!found) {
						me.error(property, value, errors, "Reporter does not exist.");
						logger.info("reporterExists " + value + " does not exist.");
					}
				}
				
				me.assertionExists( object, errors, function (err, found) {
					var property = 'record';
					if (found) {
						me.error(property, object, errors, "assertion already exists.");
						logger.info("assertionExists " + JSON.stringify(object));
					}
					
					done();
				});
			});
		});
	};

	/**
	 ** alphaReportExists verifies that, if the alpha_report_id is supplied, the alpha_report document exists.
	 ** Makes an async call to the data service to retrieve a matching alpha_report object.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the reporter_id was found. 
	**/
	me.alphaReportExists = function (value, errors, callback) {
		if (value !== undefined) {
			services.alphaReportService.findWhere({'_id': value}, function(err, docs) {
				if (err) {
					me.error('_id', value, errors, 'Error reading alpha_report ' + err);
					logger.info({ error : "Error readAlphaReportByPropery " + err });
					callback(err, false);
				} else if (0 !== docs.length) {
					logger.info("alpha_report found for alphaReportExists" + JSON.stringify(docs));
					callback(err, true);
				} else {
					logger.info("alpha_report not found " + value);
					callback(err, false);
				}
			});
		} else {
			callback(null, false);
		}
	};
  
	/**
	 ** reporterExists verifies that, if the reporter_id is supplied, the reporter document exists.
	 ** Makes an async call to the data service to retrieve a matching reporter object.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the reporter_id was found. 
	**/
	me.reporterExists = function (value, errors, callback) {
		if (value !== undefined) {
			services.reporterService.readReporterByProperty('_id', value, function(err, docs) {
				if (err) {
					me.error('_id', value, errors, 'Error reading reporter ' + err);
					logger.info({ error : "Error readReporterByPropery " + err });
					callback(err, false);
				} else if (0 !== docs.length) {
					logger.info("reporter found for reporterExists" + JSON.stringify(docs));
					callback(err, true);
				} else {
					logger.info("reporter not found " + value);
					callback(err, false);
				}
			});
		} else {
			callback(null, false);
		}
	};
  
	/**
	 * assertionExists checks for a complete duplication of the assertion object
	 */
	me.assertionExists = function(object, errors, callback) {
		if (object !== undefined) {
			services.assertionService.readAssertionByObject(object, function(err, locs){
				if (err) {
					me.error('record', object, errors, 'Error reading assertion ' + err);
					logger.info({ error : "Error readAssertionByObject " + err });
					callback(err, false);
				} else if (0 !== locs.length) {
					logger.info("assertion found for assertionExists" + JSON.stringify(locs));
					callback(err, true);
				} else {
					logger.info("assertion not found " + JSON.stringify(object));
					callback(err, false);
				}
			});
		} else {
			callback(null, false);
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