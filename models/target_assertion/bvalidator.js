module.exports = function(services, logger) {
	var me = this;
	var targetAssertionService = services.targetAssertionService;

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
	**/
	me.messages = {
		name: "Name value is incorrect",
		description: "Description value is incorrect",
		record:	"There is a record-level error"
	};
	
	me.validateObject = function(object, errors, done) {
		var value = object.name;
		me.nameExists(value, errors, function (err, found) {
			var property = 'name';
			if (value !== undefined) {
				if (found) {
					me.error(property, value, errors, "Target Assertion " + property + " already exists.");
					logger.debug("nameExists " + value);
				}
			}
			
			me.targetAssertionExists(object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					me.error(property, value, errors, "TargetAssertion already exists.");
					logger.debug("targetAssertionExists " + JSON.stringify(object));
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
		if (value !== undefined) {
			targetAssertionService.findWhere({name: value}, function(err, locs) {
				if (err) {
					me.error('name', value, errors, 'Error reading Target Assertion name ' + err);
					logger.error({error : "Error getting Target Assertion " + err});
					callback(err, false);
				} else if (0 !== locs.length) {
					logger.debug("Target Assertion found for nameExists" + JSON.stringify(locs));
					callback(err, true);
				} else {
					logger.debug("Target Assertion name not found " + value);
					callback(err, false);
				}
			});
		} else {
			callback(null, false);
		}
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
		targetAssertionService.findWhere(object, function(err, locs){
			if (err) {
				me.error('record', object, errors, 'Error reading Target Assertion ' + err);
				logger.error({ error : "Error getting Target Assertion by object " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.debug("Target Assertion found for Target Assertion exists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.debug("Target Assertion not found " + JSON.stringify(object));
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
