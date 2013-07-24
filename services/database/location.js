/**
 * Runs while connected to a database
 */

var winston = require('winston');
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
	newLoc.createdDate = new Date();
	newLoc.updatedDate = new Date();
	newLoc.save(function(err){
		if(err){
			logger.error('Error saving location', err);
			res.status(500);
			res.json({error: 'Error'});
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


this.readLocationByProperty = function(property, value, readCallback){
	var query = models.location.find({});
	query.where(property, value);
	query.exec(readCallback);
//	query.exec(function(err, docs){
//		if(err) {
//			logger.info({error: "Error getting locationByName "+err});
//		} else if(0 !== docs.length) {
//			logger.info("Location found " + JSON.stringify(docs));
//		} else {
//			logger.info({error: "Not found"});
//		}
//	});
};

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
	models.location.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting location "+err);
			res.status(500);
			res.json({error: 'Error'});
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
					res.status(500);
					res.json({error: 'Error'});
				} else {
					res.json({id:docs._id});
				}
			});			
		} else {
			res.status(404);
		}
		res.end();
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
