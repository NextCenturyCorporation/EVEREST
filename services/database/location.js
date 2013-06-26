/**
 * Runs while connected to a database
 */

/*global require */
// require is a global node function/keyword

var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');

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
	var newLoc = new models.location(data);
	newLoc.save(function(err){
		if(err){
			logger.error('Error saving location', err);
			general.send500(res);
		} else {
			res.json({id:newLoc._id});
			res.end();
		}
	});
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

/**
 * This updates the location with id specified in the URL.
 * It will not change the id.
 * On success, it returns status:ok
 */
this.updateLocation = function(id, data, res){
	models.location.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting location "+err);
			general.send500(res);
		} else if(docs) {
			for(var e in data){
				//Make sure not to change _id
				if(e != '_id'){
					docs[e] = data[e];
				}
			}
			docs.save(function(err){
				if(err){
					general.send500(res);
				} else {
					res.end({status:'ok'});
					res.end();
				}
			});
		} else {
			general.send404(res);
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