var bvalidator = require('../../models/profile/bvalidator.js');
var revalidator = require('revalidator');

var profileService = module.exports = function(models, io, log) {
	var me = this;

	me.logger = log;
	me.io = io;
	me.models = models;

	me.profileValidation = me.models.profileValidation;
};

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
profileService.prototype.validateProfile = function(data, valCallback) {
	var me = this;

	// is the JSON semantically valid for the profile object?
	var valid = revalidator.validate(data, me.profileValidation);
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

//TODO Remove this, this is just an example for event handling.
profileService.prototype.sampleProfileEvent = function () {
	console.log("The sample Profile Event has been called!");
	console.log("The arguments fed into the event are: ");
	console.log(arguments);
}

/**
 * Returns a list of all the profiles
 */
profileService.prototype.list = function(params, callback) {
	var me = this;

	//FIXME params
	me.findWhere({}, callback);
};

/**
 * Returns a list of all the profile ids and names
 */
profileService.prototype.listFields = function(params, fields, callback){
	var me = this;

	//FIXME params
	me.models.profile.find({}, fields, callback);
};

/**
 * Creates a new profile from the data POSTed
 * See the Profile schema in models.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
 */
profileService.prototype.create = function(data, saveCallback) {
	var me = this;

	me.validateProfile(data, function(valid) {
		if (valid.valid) {
			me.logger.info("Valid profile");
			var newLoc = new me.models.profile(data);
			newLoc.createdDate = new Date();
			newLoc.updatedDate = new Date();
			newLoc.save(function(err){
				if(err){
					me.logger.error('Error saving profile', err);
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
 * Returns the profile with the id specified in the URL
 */
profileService.prototype.get = function(id, getCallback){
	var me = this;
	me.find({_id: id}, getCallback);
};

profileService.prototype.findWhere = function(config, callback) {
	var me = this;
	me.models.profile.find(config, callback);
};

/**
 * searchProfile is experimental -- uses the SEARCH HTTP verb
 */
/*var searchProfile = function(data, res){
	var me = this;

	me.models.profile.find({name:data.name}, function(err, docs){
		if(err) {
			me.logger.info("Error getting profile "+err);
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
};*/

/**
 * update calls the validateProfile then updates the object
 * 
 * callback takes the form of  function(err, valid object, profile object)
 */
profileService.prototype.update = function(id, data, updCallback) {
	var me = this;

	me.validateProfile(data, function(valid){
		if (valid.valid) {
			me.models.profile.findById(id, function(err, docs){
				if(err) {
					me.logger.info("Error getting profile "+err);
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

profileService.prototype.del = function(config, deleteCallback) {
	var me = this;

	me.models.profile.remove(config, deleteCallback);
};