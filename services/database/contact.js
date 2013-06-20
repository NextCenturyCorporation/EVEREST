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
 * Returns a list of all the contact names and ids
 */
this.listContacts = function(res){
	models.contact.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing contacts "+err);
			general.send500(res);
		} else {
			res.json(docs);
		}
		res.end();
	});
};

/**
 * Creates a new contact object based on the data POSTed.
 * See the Contact schema for details on what to post.
 * All validation is handled through the schema.
 *
 * On success, it returns id:<ID-hash>
 */
this.createContact = function(data, res){
	var newContact = new models.contact(data);
	newContact.save(function(err){
		if(err){
			logger.error('Error saving contact',err);
			general.send500(res);
		} else {
			res.json({id:newContact._id});
			res.end();
		}
	});
};

/**
 * Returns the contact object with id specified in the URL.
 */
this.getContact = function(id, res){
	models.contact.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting contact "+err);
			general.send500(res);
		} else if(docs) {
			res.json(docs);
		} else {
			general.send404(res);
		}
		res.end();
	});
};

/**
 * This updates the location with id specified in the URL.
 * It will not change the id.
 * On success, it returns status:ok
 */
this.updateContact = function(id, data, res){
	models.contact.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting contact "+err);
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
					logger.error('Error updating contact',err);
					general.send500(res);
				}
				res.json({status:'ok'});
				res.end();
			});
		} else {
			general.send404(res);
		}
		res.end();
	});
};

/**
 * Deletes the contact with the given id
**/
// bbn 20-JUN-13  changed calling signature
//this.deleteContact = function(id, data, res) {
this.deleteContact = function(id, res) {
	models.contact.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting contact', err);
			general.send500(res);
		} else {
			for(var i = 0; i < docs.length; i++){
				docs[i].remove();
			}
			res.json({status:'ok'});
			res.end();
		}//;
	});
};