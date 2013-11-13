/**
 * Profile business validation library
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
		name: "Name value is incorrect",
		email: "Latitude value is incorrect",
		record:	"There is a record-level error"
	};

	me.validateObject = function(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the name attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.name;
		me.nameExists(value, errors, function (err, found) {
			var property = 'name';
			if (found) {
				me.error(property, value, errors, "Profile " + property + " already exists.");
				logger.debug("nameExists " + value);
			}
	
			me.profileExists(object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					me.error(property, value, errors, "Profile already exists.");
					logger.debug("profileExists " + JSON.stringify(object));
				}
				done();
			});
		});
	};

	/**
	 * nameExists verifies the uniqueness of the name in the object.
	 * Makes an async call to the data service to retrieve a matching object.
	 * If found, submits an error to the errors collection.
	 * Returns in the callback any system error and a boolean indicating whether
	 *   or not the name was found. 
	 */
	me.nameExists = function (value, errors, callback) {
		services.profileService.findWhere({name: value}, function(err, docs) {
			if (err) {
				me.error('name', value, errors, 'Error reading Profile name ' + err);
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
	 * profileExists verifies the uniqueness of the entire profile object.
	 * Makes an async call to the data service to retrieve a matching profile
	 *   matching against all object attributes.
	 * If found, submits an error to the errors collection.
	 * Returns in the callback any system error and a boolean indicating whether
	 *   or not the profile was found. 
	 */
	me.profileExists = function(object, errors, callback) {
		services.profileService.findWhere(object, function(err, docs) {
			if (err) {
				me.error('record', object, errors, 'Error reading Profile ' + err);
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