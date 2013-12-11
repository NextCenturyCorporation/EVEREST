/*
 * Event_ business validation library
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
		description: "Description value is incorrect",
		record: "There is a record-level error"
	};
	
	me.validateObject = function(object, errors, done) {
		// TODO: put in the logic checks against the object (ie., does the name attribute exist)
		//       to insulate the lower level functions from bad data
		var id = object._id;
		var value = object.name;
		me.nameExists(id, value, errors, function(err, found) {
			var property = 'name';
			if (found) {
				me.error(property, value, errors, "Event " + property + " already exists.");
				logger.debug("nameExists " + value);
			}
	
			me.eventExists(object, errors, function(err, found) {
				var property = 'record';
				if (found) {
					me.error(property, value, errors, "Event already exists.");
					logger.debug("eventExists " + JSON.stringify(object));
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
	me.nameExists = function (id, value, errors, callback) {
		if (value !== undefined) {
			services.eventService.findWhere({name: value}, function(err, docs) {
				if (err) {
					me.error('name', value, errors, 'Error reading Event name ' + err);
					logger.error({ error : "Error getting eventByName " + err });
					callback(err, false);
				} else if (0 !== docs.length) {
					if (id.toString() !== docs[0]._id.toString()){
						logger.debug("Event found for nameExists" + JSON.stringify(docs));
						callback(err, true);
					} else {
						logger.debug("Event found for nameExists matching current _id" + JSON.stringify(docs));
						callback(err, false);
					}
				} else {
					logger.debug("Event name not found " + value);
					callback(err, false);
				}
			});
		}
	};
  
	/**
	 * eventExists verifies the uniqueness of the entire object.
	 * Makes an async call to the data service to retrieve a matching object
	 *   matching against all object attributes.
	 * If found, submits an error to the errors collection.
	 * Returns in the callback any system error and a boolean indicating whether
	 *   or not the target event was found. 
	 */
	me.eventExists = function(object, errors, callback) {
		services.eventService.findWhere(object, function(err, docs) {
			if (err) {
				me.error('record', object, errors, 'Error reading Event_ ' + err);
				logger.error({ error : "Error getting Event by object " + err });
				callback(err, false);
			} else if (0 !== docs.length) {
				logger.debug("Event found for event_Exists" + JSON.stringify(docs));
				callback(err, true);
			} else {
				logger.debug("Event not found " + JSON.stringify(object));
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
