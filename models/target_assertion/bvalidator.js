module.exports = function(services, logger) {
	var me = this;
	var targetAssertion = services.targetAssertion;

	/**
	 * Default messages to include with validation errors.
	**/
	me.messages = {
		name:			"Name value is incorrect",
		description:	"Description value is incorrect",
		record:			"There is a record-level error"
	};

	me.validate = function(object, callback) {
		var errors = [];
	
		function done() {
			var bVal = { valid: !(errors.length), errors: errors };
			callback(bVal);
		}

		me.validateObject(object, errors, done);
	};

	me.validateObject = function(object, errors, done) {
		var value = object.name;
		me.nameExists( value, errors, function (err, found) {
			var property = 'name';
			if (found) {
				me.error(property, value, errors, "TargetAssertion " + property + " already exists.");
				logger.info("nameExists " + value);
			}
	
			me.targetAssertionExists( object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					me.error(property, value, errors, "TargetAssertion already exists.");
					logger.info("targetAssertionExists " + JSON.stringify(object));
				}
				done();
			});
		});
	};

	/**
	 ** nameExists verifies the uniqueness of the name in the object.
	 ** Makes an async call to the data service to retrieve a matching object.
	 ** If found, submits an error to the errors collection.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the name was found. 
	**/
	me.nameExists = function (value, errors, callback) {
		targetAssertion.findWhere({name: value}, function(err, locs) {
			if (err) {
				me.error('name', value, errors, 'Error reading targetAssertion name ' + err);
				logger.info({ error : "Error getting targetAssertionByName " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("TargetAssertion found for nameExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("TargetAssertion name not found " + value);
				callback(err, false);
			}
		});
	};
  

	/**
	 * targetAssertionExists verifies the uniqueness of the entire object.
	 * Makes an async call to the data service to retrieve a matching object
	 * matching against all object attributes.
	 * If found, submits an error to the errors collection.
	 * Returns in the callback any system error and a boolean indicating whether
	 * or not the target assertion was found. 
	**/
	me.targetAssertionExists = function(object, errors, callback) {
		targetAssertion.findWhere(object, function(err, locs){
			if (err) {
				me.error('record', object, errors, 'Error reading targetAssertion ' + err);
				logger.info({ error : "Error getting targetAssertionByObject " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("TargetAssertion found for targetAssertionExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("TargetAssertion not found " + JSON.stringify(object));
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
