/**
 * place business validation library
 */
 
module.exports = function(services, logger){
	var me = this;
	
	me.validate = function(object, callback){
		var errors = [];
		
		me.done = function(){
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
		latitude: "Latitude value is incorrect",
		longitude: "Longitude value is incorrect",
		radius: "Radius value is incorrect",
		record: "There is a record-level error"
	};
	
	me.validateObject = function(object, errors, done){
		// TODO: put in the logic checks against the object (ie., does the name attribute exist)
		//       to insulate the lower level functions from bad data
		var value = object.name;
		me.nameExists(value, errors, function (err, found) {
			var property = 'name';
			if (found) {
				me.error(property, value, errors, "Place " + property + " already exists.");
				logger.info("nameExists " + value);
			}
	
			me.placeExists(object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					me.error(property, value, errors, "Place already exists.");
					logger.info("placeExists " + JSON.stringify(object));
				}
				done();
			});
		});
	};
	
	/**
	 ** nameExists verifies the uniqueness of the place name in the object.
	 ** Makes an async call to the data service to retrieve a matching place.
	 ** If found, submits an error to the errors collection.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the name was found. 
	**/
	me.nameExists = function(value, errors, callback){
		services.placeService.findWhere({name: value}, function(err, locs) {
			if (err) {
				me.error('name', value, errors, 'Error reading place name ' + err);
				logger.info({ error : "Error getting placeByName " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("Place found for nameExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("Place name not found " + value);
				callback(err, false);
			}
		});
	};
	
	/**
	 ** placeExists verifies the uniqueness of the entire place object.
	 ** Makes an async call to the data service to retrieve a matching place
	 **   matching against all object attributes.
	 ** If found, submits an error to the errors collection.
	 ** Returns in the callback any system error and a boolean indicating whether
	 **   or not the place was found. 
	**/
	me.placeExists = function(object, errors, callback){
		services.placeService.findWhere(object, function(err, locs){
			if (err) {
				me.error('record', object, errors, 'Error reading place ' + err);
				logger.info({ error : "Error getting placeByObject " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("Place found for placeExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("Place not found " + JSON.stringify(object));
				callback(err, false);
			}
		});
	};
	
	me.error = function(property, actual, errors, msg){
		var lookup = {
			property : property
		};
	
		var message = msg || validate.messages[property] || "no default message";
	
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