/**
 * Runs while connected to a database
 */
var winston = require('winston');
var models = require('../../models/models');
var validationModel = require('../../models/location/model.js');
var bvalidator = require('../../models/location/bvalidator.js');
var revalidator = require('revalidator');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * Returns a list of all the locations
 */
this.listLocations = function(res){
	models.location.find({}, function(err, docs){
		if(err){
			logger.info("Error listing locations "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

/**
 * Returns a list of all the location ids and names
 */
this.listLocationNames = function(res){
	models.location.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing location id - name "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};


/**
 * Creates a new location from the data POSTed
 * See the Location schema in models.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
 */
this.createLocation = function(data, res){
	this.saveLocation(data, function(err, val, newLoc) {
		if(err){
			logger.error('Error saving location', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid location ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Location saved ' + JSON.stringify(newLoc));
			res.json({id:newLoc._id});
		}
		res.end();
	});
};

/**
 * saveLocation is a "generic" save method callable from both
 * request-response methods and parser-type methods for population of location data
 * 
 * saveLocation calls the validateLocation module to ensure that the
 * location data being saved to the database is complete and has integrity.
 * 
 * saveCallback takes the form of  function(err, valid object, location object)
 */
this.saveLocation = function(data, saveCallback) {
	this.validateLocation(data, function(valid) {
		if (valid.valid) {
			logger.info("Valid location");
			var newLoc = new models.location(data);
			newLoc.createdDate = new Date();
			newLoc.updatedDate = new Date();
			newLoc.save(function(err){
				if(err){
					logger.error('Error saving location', err);
				}
				saveCallback(err, valid, newLoc);
			});
		}
		else {
			saveCallback(undefined, valid, data);
		}
	});
};

/**
 * validateLocation validates a location object against the location semantic rules
 * and the business rules associated with a location
 *
 * saveLocation calls the JSON validation module  revalidator and
 * calls the business validation module bvalidator for the location object

 * data is the location object being validated
 * 
 * valCallback takes the form of  function(valid structure)
 */
this.validateLocation = function(data, valCallback) {
	// is the JSON semantically valid for the location object?
	var valid = revalidator.validate(data, validationModel.locationValidation);
	if (valid.valid) {
		// does the location object comply with business validation logic
		bvalidator.validate(data, function(valid) {
			valCallback(valid);
		});
	}
	else {
		valCallback(valid);
	}	
};

/**
 * Returns the location with the id specified in the URL
 */
this.getLocation = function(id, res){
	models.location.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting location "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(docs) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};


this.getLocationByName = function(value, res){
	models.location.find({name:value}, function(err, docs){
		if(err) {
			logger.info("Error getting locationByName "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(0 !== docs.length) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};

/**
 * readLocationByProperty is a generic read method to return all of
 * documents that have a property value that matches.
 * 
 * The readCallback should be function(err, docs)
 */
this.readLocationByProperty = function(property, value, readCallback){
	var query = models.location.find({});
	query.where(property, value);
	query.exec(readCallback);
};

/**
 * readAssertionByObject is a generic read method for assertion
 * It will attempt to find an exact match(es) for the object provided.
 * 
 * Note: the incoming object can be a subset or superset of the actual object.
 * 
 * The readCallback should be function(err, docs)
 */
this.readLocationByObject = function(object, readCallback){
	var query = models.location.find({});
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			query.where(key, object[key]);
		}
	}
	query.exec(readCallback);
};

this.searchLocation = function(data, res){
	models.location.find({name:data.name}, function(err, docs){
		if(err) {
			logger.info("Error getting location "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(docs.length !== 0) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};

/**
 * This updates the location with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
this.updateLocation = function(id, data, res){
	this.updateLocationX(id, data, function(err, val, updLoc) {
		if(err){
			logger.error('Error updating location', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid location ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Location updated ' + JSON.stringify(updLoc));
			res.json({id:updLoc._id});
		}
		res.end();
	});
};
/**
 *
 * callback takes the form of  function(err, valid object, location object)
 * 
 */
this.updateLocationX = function(id, data, updCallback) {
	this.validateLocation(data, function(valid){
		if (valid.valid) {
			models.location.findById(id, function(err, docs){
				if(err) {
					logger.info("Error getting location "+err);
					updCallback(err, valid, data);
				} else if(docs) {
					for(var e in data){
						//Make sure not to change _id
						if(e !== '_id'){
							docs[e] = data[e];
						}
					}
					docs.updatedDate = new Date();
					docs.save(function(err){
						if(err){
							updCallback(err, valid, data);
						} else {
							updCallback(err, valid, docs);
						}
					});			
				} else {
					valid.valid = false;
					valid.errors = {expected: id, message: "Location not found"};
					updCallback(err, valid, data);
				}
			});
		}
		else {
			updCallback(undefined, valid, data);
		}
	});
};

/**
 * Deletes the location with the given ID
**/
this.deleteLocation = function(id, data, res) {
	models.location.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting location '+id, err);
			res.status('500');
			res.json({error:'Invalid location '+id});
			res.end();
		} else {
			for(var i = 0; i < docs.length; i++){
				docs[i].remove();
			}
			res.json({status:'ok'});
			res.end();
		}//;
	});
};

/**
 * Deletes all locations
**/
this.deleteLocations = function(res) {
	models.location.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};
