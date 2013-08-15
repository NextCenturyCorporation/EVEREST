/**
 * location business validation library
 */

var questionValidation = module.exports = function(services, logger) {
	var me = this;

	me.logger = logger;
	me.services = services;

	/**
	* Default messages to include with validation errors.
	*/
	me.messages = {
		alpha_report_id: "Alpha report id is invalid",
		target_event_id: "",
		profile_id: "",
		assertions: ""
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
			me.error('name', value, errors, 'Error reading question string ' + err);
			me.logger.error("Error getting alphaReport by question string ", err);
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

questionValidation.prototype.targetEventIsValid = function(/*value, errors, callback*/) {
	
};

questionValidation.prototype.profileIsValid = function(value, errors, callback) {
	var me = this;
	
	me.services.profileService.get(value, function(err, docs) {
		if (err) {
			me.error('name', value, errors, 'Error reading question string ' + err);
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

questionValidation.prototype.assertionsAreValid = function(/*value, errors, callback*/) {
	//FIXME
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