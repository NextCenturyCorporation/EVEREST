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
		var id = object._id;
		var value = object.name;
		me.nameExists(id, value, errors, function (err, found) {
			var property = 'name';
			if (found) {
				me.error(property, value, errors, "Place " + property + " already exists.");
				logger.debug("nameExists " + value);
			}
	
			me.placeExists(object, errors, function (err, found) {
				var property = 'record';
				if (found) {
					me.error(property, value, errors, "Place already exists.");
					logger.debug("placeExists " + JSON.stringify(object));
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
	me.nameExists = function(id, value, errors, callback){
		services.placeService.findWhere({name: value}, function(err, docs) {
			if (err) {
				me.error('name', value, errors, 'Error reading place name ' + err);
				logger.debug({ error : "Error getting placeByName " + err });
				callback(err, false);
			} else if (0 !== docs.length) {
				if (id && id.toString() === docs[0]._id.toString()){
					logger.debug("Place found for nameExists matching current _id" + JSON.stringify(docs));
					callback(err, false);
				} else {
					logger.debug("Place found for nameExists" + JSON.stringify(docs));
					callback(err, true);
				}
			} else {
				logger.debug("Place name not found " + value);
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
		services.placeService.findWhere(object, function(err, docs){
			if (err) {
				me.error('record', object, errors, 'Error reading place ' + err);
				logger.debug({ error : "Error getting placeByObject " + err });
				callback(err, false);
			} else if (0 !== docs.length) {
				logger.debug("Place found for placeExists" + JSON.stringify(docs));
				callback(err, true);
			} else {
				logger.debug("Place not found " + JSON.stringify(object));
				callback(err, false);
			}
		});
	};
	
	me.error = function(property, actual, errors, msg){
		var lookup = {
			property : property
		};
	
		var message = msg || me.validate.messages[property] || "no default message";
	
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