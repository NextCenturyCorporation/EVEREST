/**
 * location business validation library
 */
var async = require('async');

var questionValidation = module.exports = function(services, logger) {
	var me = this;

	me.logger = logger;
	me.services = services;

	/**
	* Default messages to include with validation errors.
	*/
	me.messages = {
		alpha_report_id: "Alpha report id is invalid",
		target_assertion_id: "Target assertion id is invalid",
		profile_id: "Profile id is invalid",
		assertions: "Assertions are invalid"
	};
};

questionValidation.prototype.validate = function(object, callback) {
	var me = this;
	var errors = [];

	function done() {
		var bVal = { valid: !(errors.length), errors: errors };
		callback(bVal);
	}

	me.validateObject(object, errors, done);
};

  
questionValidation.prototype.validateObject = function(object, errors, done) {
	var me = this;
	
	var value = object.alpha_report_id;
	me.alphaReportExists(value, errors, function (err, found) {
		var property = 'alpha_report_id';
		if (!found) {
			me.error(property, value, errors, "Alpha report could not be found based on " + property);
			me.logger.info("questionExists " + value);
		}

		value = object.target_event_id;
		property = 'target_event_id';
		me.targetEventIsValid(value, errors, function(err, targetEventValid) {
			if(!targetEventValid){
				me.error(property, value, errors, "Target event could not be found based on " + property);
				me.logger.info("targetEventIsValid " + value);
			}

			value = object.profile_id;
			property = 'profile_id';
			me.profileIsValid(value, errors, function(err, profileValid) {
				if(!profileValid){
					me.error(property, value, errors, "Target event could not be found based on " + property);
					me.logger.info("profileIsValid " + value);
				}

				value = object.assertions;
				property = 'assertions';
				me.assertionsAreValid(value, errors, function(err, assertionsValid) {
					if(!assertionsValid) {
						me.error(property, value, errors, "Assertions are invalid");
						me.logger.info("assertionsAreValid " + value);
					}

					done();
				});
			});
		});
	});
};

//alpha report exists
questionValidation.prototype.alphaReportExists = function(value, errors, callback) {
	var me = this;

	me.services.alphaReportService.get(value, function(err, docs) {
		if (err) {
			me.error('alpha_report_id', value, errors, 'Error reading alpha_report_id ' + err);
			me.logger.error("Error getting alphaReport by id ", err);
			callback(err, false);
		} else if (0 !== docs.length) {
			me.logger.info("Alpha Report found for alphaReportExists" + JSON.stringify(docs));
			callback(err, true);
		} else {
			me.logger.info("Alpha Report not found " + value);
			callback(err, false);
		}
	});
};

questionValidation.prototype.targetAssertionIsValid = function(value, errors, callback) {
	var me = this;

	me.services.targetAssertionService.get(value, function(err, docs) {
		if (err) {
			me.error('target_assertion_id', value, errors, 'Error reading target assertion ' + err);
			me.logger.error("Error getting targetAssertion by id ", err);
			callback(err, false);
		} else if (0 !== docs.length) {
			me.logger.info("Target Assertion found for targetAssertionIsValid" + JSON.stringify(docs));
			callback(err, true);
		} else {
			me.logger.info("Target Assertion not found " + value);
			callback(err, false);
		}
	});
};

questionValidation.prototype.profileIsValid = function(value, errors, callback) {
	var me = this;
	
	me.services.profileService.get(value, function(err, docs) {
		if (err) {
			me.error('profile_id', value, errors, 'Error reading profile ' + err);
			me.logger.error("Error getting profile by id ", err);
			callback(err, false);
		} else if (0 !== docs.length) {
			me.logger.info("Profile found for profile" + JSON.stringify(docs));
			callback(err, true);
		} else {
			me.logger.info("Profile string not found " + value);
			callback(err, false);
		}
	});
};

questionValidation.prototype.assertionsAreValid = function(value, errors, callback) {
	var me = this;

	async.each(value, function(assertion, eachCallback) {
		me.services.profileService.get(assertion, function(err, assertionDoc) {
			if (err) {
				me.error('assertions', value, errors, 'Error reading assertion ' + err);
				me.logger.error("Error getting assertion by id ", err);
				eachCallback(err);
			} else if (0 !== assertionDoc.length) {
				me.logger.info("Assertion found for assertionsAreValid" + JSON.stringify(assertionDoc));
				eachCallback(err);
			} else {
				me.logger.info("Assertion not found " + value);
				eachCallback(err);
			}
		});
	}, function(err) {
		if(err) {
			callback(err, false);
		} else {
			callback(err, true);
		}
	});
};
  
	
questionValidation.prototype.error = function(property, actual, errors, msg) {
	var me = this;

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