/**
 * Runs while connected to a database
 */
var winston = require('winston');
var models = require('../../models/models');
var validationModel = require('../../models/profile/model.js');
var bvalidator = require('../../models/profile/bvalidator.js');
var revalidator = require('revalidator');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * Returns a list of all the profiles
 */
var listProfiles = function(res){
	models.profile.find({}, function(err, docs){
		if(err){
			logger.info("Error listing profiles "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

exports.listProfiles = listProfiles;

/**
 * Returns a list of all the profile ids and names
 */
var listProfileNames = function(res){
	models.profile.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing profile id - name "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

exports.listProfileNames = listProfileNames;


/**
 * Creates a new profile from the data POSTed
 * See the Profile schema in models.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
 */
var createProfile = function(data, res){
	saveProfile(data, function(err, val, newLoc) {
		if(err){
			logger.error('Error saving profile', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid profile ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Profile saved ' + JSON.stringify(newLoc));
			res.json({id:newLoc._id});
		}
		res.end();
	});
};

exports.createProfile = createProfile;

/**
 * saveProfile is a "generic" save method callable from both
 * request-response methods and parser-type methods for population of profile data
 * 
 * saveProfile calls the validateProfile module to ensure that the
 * profile data being saved to the database is complete and has integrity.
 * 
 * saveCallback takes the form of  function(err, valid object, profile object)
 */
var saveProfile = function(data, saveCallback) {
	validateProfile(data, function(valid) {
		if (valid.valid) {
			logger.info("Valid profile");
			var newLoc = new models.profile(data);
			newLoc.createdDate = new Date();
			newLoc.updatedDate = new Date();
			newLoc.save(function(err){
				if(err){
					logger.error('Error saving profile', err);
				}
				saveCallback(err, valid, newLoc);
			});
		}
		else {
			saveCallback(undefined, valid, data);
		}
	});
};

exports.saveProfile = saveProfile;

/**
 * validateProfile validates a profile object against the profile semantic rules
 * and the business rules associated with a profile
 *
 * validateProfile calls the JSON validation module  revalidator and
 * calls the business validation module bvalidator for the profile object

 * data is the profile object being validated
 * 
 * valCallback takes the form of  function(valid structure)
 */
var validateProfile = function(data, valCallback) {
	// is the JSON semantically valid for the profile object?
	var valid = revalidator.validate(data, validationModel.profileValidation);
	if (valid.valid) {
		// does the profile object comply with business validation logic
		bvalidator.validate(data, function(valid) {
			valCallback(valid);
		});
	}
	else {
		valCallback(valid);
	}	
};

exports.validateProfile = validateProfile;

/**
 * Returns the profile with the id specified in the URL
 */
var getProfile = function(id, res){
	models.profile.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting profile "+err);
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

exports.getProfile = getProfile;

/**
 * getProfileByName
 */
var getProfileByName = function(value, res){
	models.profile.find({name:value}, function(err, docs){
		if(err) {
			logger.info("Error getting profileByName "+err);
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

exports.getProfileByName = getProfileByName;

/**
 * readProfileByProperty is a generic read method to return all of
 * documents that have a property value that matches.
 * 
 * The readCallback should be function(err, docs)
 */
var readProfileByProperty = function(property, value, readCallback){
	var query = models.profile.find({});
	query.where(property, value);
	query.exec(readCallback);
};

exports.readProfileByProperty = readProfileByProperty;

/**
 * readAssertionByObject is a generic read method for assertion
 * It will attempt to find an exact match(es) for the object provided.
 * 
 * Note: the incoming object can be a subset or superset of the actual object.
 * 
 * The readCallback should be function(err, docs)
 */
var readProfileByObject = function(object, readCallback){
	var query = models.profile.find({});
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			query.where(key, object[key]);
		}
	}
	query.exec(readCallback);
};

exports.readProfileByObject = readProfileByObject;

/**
 * searchProfile is experimental -- uses the SEARCH HTTP verb
 */
var searchProfile = function(data, res){
	models.profile.find({name:data.name}, function(err, docs){
		if(err) {
			logger.info("Error getting profile "+err);
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

exports.searchProfile = searchProfile;

/**
 * This updates the profile with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
var updateProfile = function(id, data, res){
	updateProfileX(id, data, function(err, val, updLoc) {
		if(err){
			logger.error('Error updating profile', err);
			res.status(500);
			res.json({error: 'Error'});
		} else if (!val.valid) {
			logger.info('Invalid profile ' + JSON.stringify(val.errors));
			res.status(500);
			res.json({error: val.errors}, data);
		} else {
			logger.info('Profile updated ' + JSON.stringify(updLoc));
			res.json({id:updLoc._id});
		}
		res.end();
	});
};

exports.updateProfile = updateProfile;

/**
 * updateProfileX calls the validateProfile then updates the object
 * 
 * callback takes the form of  function(err, valid object, profile object)
 */
var updateProfileX = function(id, data, updCallback) {
	validateProfile(data, function(valid){
		if (valid.valid) {
			models.profile.findById(id, function(err, docs){
				if(err) {
					logger.info("Error getting profile "+err);
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
					valid.errors = {expected: id, message: "Profile not found"};
					updCallback(err, valid, data);
				}
			});
		}
		else {
			updCallback(undefined, valid, data);
		}
	});
};

exports.updateProfileX = updateProfileX;

/**
 * Deletes the profile with the given ID
**/
var deleteProfile = function(id, data, res) {
	models.profile.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting profile '+id, err);
			res.status('500');
			res.json({error:'Invalid profile '+id});
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

exports.deleteProfile = deleteProfile;

/**
 * Deletes all profiles
**/
var deleteProfiles = function(res) {
	models.profile.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};

exports.deleteProfiles = deleteProfiles;