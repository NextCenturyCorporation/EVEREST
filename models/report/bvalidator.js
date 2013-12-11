/**
 * report business validation library
 */
var async = require('async');

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
		alpha_report_id: "Alpha Report id is invalid",
		target_event_id: "Target Event id is invalid",
		profile_id: "Profile id is invalid"
	};

	me.validateObject = function(object, errors, done) {
		var value = object.alpha_report_id;
		me.alphaReportExists(value, errors, function (err, found) {
			var property = 'alpha_report_id';
			if (value !== undefined){
				if (!found) {
					me.error(property, value, errors, "Alpha Report does not exist.");
					logger.debug("alphaReportExists " + value + " does not exist.");
				}
			}	
			
			value = object.target_event_id;
			me.targetEventExists(value, errors, function(err, found) {
				var property = 'target_event_id';
				if (value !== undefined) {
					if (!found){
						me.error(property, value, errors, "Target Event does not exist.");
						logger.debug("targetEventExists " + value + " does not exist.");
					}
				}
				
				value = object.profile_id;
				me.profileExists(value, errors, function(err, found) {
					var property = 'profile_id';
					if (value !== undefined) {
						if (!found) {
							me.error(property, value, errors, "Profile does not exist.");
							logger.debug("profileExists " + value + " does not exist");
						}
					}
					
					done();
				});
			});
		});
	};

	//alpha report exists
	me.alphaReportExists = function(value, errors, callback) {
		services.alphaReportService.get(value, function(err, docs) {
			if (err) {
				me.error('alpha_report_id', value, errors, 'Error reading alpha_report_id ' + err);
				logger.error("Error getting alphaReport by id ", err);
				callback(err, false);
			} else if (0 !== docs.length) {
				logger.info("Alpha Report found for alphaReportExists" + JSON.stringify(docs));
				callback(err, true);
			} else {
				logger.info("Alpha Report not found " + value);
				callback(err, false);
			}
		});
	};

	me.targetEventExists = function(value, errors, callback) {
		if(typeof(value) === 'undefined' || !value) {
			callback(null, true);
		} else {

			services.targetEventService.get(value, function(err, docs){
				if (err) {
					me.error('target_event_id', value, errors, 'Error reading target_event_id ' + err);
					me.logger.error("Error getting targetEvent by id ", err);
					callback(err, false);
				} else if (0 !== docs.length) {
					me.logger.info("Target Event found for targetEventIsValid" + JSON.stringify(docs));
					callback(err, true);
				} else {
					me.logger.info("Target Event not found " + value);
					callback(err, false);
				}
			});
		}
	};

	me.profileExists = function(value, errors, callback) {
		if(typeof(value) === 'undefined' || !value) {
			callback(null, true);
		} else {
			services.profileService.get(value, function(err, docs) {
				if (err) {
					me.error('profile_id', value, errors, 'Error reading profile ' + err);
					logger.error("Error getting profile by id ", err);
					callback(err, false);
				} else if (0 !== docs.length) {
					logger.info("Profile found for profile" + JSON.stringify(docs));
					callback(err, true);
				} else {
					logger.info("Profile string not found " + value);
					callback(err, false);
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