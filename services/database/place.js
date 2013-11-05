/**
 * Runs while connected to a database
 */
var winston = require('winston');
var models = require('../../models/models');
var validationModel = require('../../models/place/model.js');
var bvalidator = require('../../models/place/bvalidator.js');
var revalidator = require('revalidator');
var paramHandler = require('../list_default_handler');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * Returns a list of all the places
 */
this.listPlaces = function(req, res){
	this.findPlaces(req, function(err, docs){
		if(err){
			logger.info("Error listing places "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

this.findPlaces = function(req, callback) {
	paramHandler.handleDefaultParams(req.query, function(params) {
		if (params !== null) {
			models.place.find().limit(params.count).skip(params.offset).sort({_id: params.sort}).exec(callback);
		} else {
			models.place.find().exec(callback);
		}
	});
};


/**
 * Returns a list of all the place ids and names
 */
this.listPlaceNames = function(res){
	models.place.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing place id - name "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};


/**
 * Creates a new place from the data POSTed
 * See the Place schema in models.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
 */
this.createPlace = function(data, res){
	this.savePlace(data, function(err, val, newLoc) {
		if(err){
			logger.error('Error saving place', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid place ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Place saved ' + JSON.stringify(newLoc));
			res.json({id:newLoc._id});
		}
		res.end();
	});
};

/**
 * savePlace is a "generic" save method callable from both
 * request-response methods and parser-type methods for population of place data
 * 
 * savePlace calls the validatePlace module to ensure that the
 * place data being saved to the database is complete and has integrity.
 * 
 * saveCallback takes the form of  function(err, valid object, place object)
 */
this.savePlace = function(data, saveCallback) {
	this.validatePlace(data, function(valid) {
		if (valid.valid) {
			logger.info("Valid place");
			var newLoc = new models.place(data);
			newLoc.createdDate = new Date();
			newLoc.updatedDate = new Date();
			newLoc.save(function(err){
				if(err){
					logger.error('Error saving place', err);
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
 * validatePlace validates a place object against the place semantic rules
 * and the business rules associated with a place
 *
 * validatePlace calls the JSON validation module  revalidator and
 * calls the business validation module bvalidator for the place object

 * data is the place object being validated
 * 
 * valCallback takes the form of  function(valid structure)
 */
this.validatePlace = function(data, valCallback) {
	// is the JSON semantically valid for the place object?
	var valid = revalidator.validate(data, validationModel.placeValidation);
	if (valid.valid) {
		// does the place object comply with business validation logic
		bvalidator.validate(data, function(valid) {
			valCallback(valid);
		});
	}
	else {
		valCallback(valid);
	}	
};

/**
 * Returns the place with the id specified in the URL
 */
this.getPlace = function(id, res){
	models.place.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting place "+err);
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


this.getPlaceByName = function(value, res){
	models.place.find({name:value}, function(err, docs){
		if(err) {
			logger.info("Error getting placeByName "+err);
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
 * readPlaceByProperty is a generic read method to return all of
 * documents that have a property value that matches.
 * 
 * The readCallback should be function(err, docs)
 */
this.readPlaceByProperty = function(property, value, readCallback){
	var query = models.place.find({});
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
this.readPlaceByObject = function(object, readCallback){
	var query = models.place.find({});
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			query.where(key, object[key]);
		}
	}
	query.exec(readCallback);
};

/**
 * searchPlace is experimental -- uses the SEARCH HTTP verb
 */
this.searchPlace = function(data, res){
	models.place.find({name:data.name}, function(err, docs){
		if(err) {
			logger.info("Error getting place "+err);
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
 * This updates the place with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
this.updatePlace = function(id, data, res){
	this.updatePlaceX(id, data, function(err, val, updLoc) {
		if(err){
			logger.error('Error updating place', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid place ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Place updated ' + JSON.stringify(updLoc));
			res.json({id:updLoc._id});
		}
		res.end();
	});
};

/**
 * updatePlaceX calls the validatePlace then updates the object
 * 
 * callback takes the form of  function(err, valid object, place object)
 */
this.updatePlaceX = function(id, data, updCallback) {
	this.validatePlace(data, function(valid){
		if (valid.valid) {
			models.place.findById(id, function(err, docs){
				if(err) {
					logger.info("Error getting place "+err);
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
					valid.errors = {expected: id, message: "Place not found"};
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
 * Deletes the place with the given ID
**/
this.deletePlace = function(id, data, res) {
	models.place.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting place '+id, err);
			res.status('500');
			res.json({error:'Invalid place '+id});
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
 * Deletes all places
**/
this.deletePlaces = function(res) {
	models.place.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};
