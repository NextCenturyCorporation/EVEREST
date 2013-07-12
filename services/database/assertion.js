/**
 * Runs while connected to a database
 */
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
 * Returns a list of all the assertions
 */
this.listAssertions = function(res){
	models.assertion.find({}, function(err, docs){
		if(err){
			logger.info("Error listing assertions "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

/**
 * Creates a new assertion from the data POSTed
 * See the Assertion schema in models.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
 */
this.createAssertion = function(data, res){
	var newAssertion = new models.assertion(data);
	newAssertion.createdDate = new Date();
	newAssertion.updatedDate = new Date();
	newAssertion.save(function(err){
		if(err){
			logger.error('Error saving assertion', err);
			general.send500(res);
		} else {
			res.json({id:newAssertion._id});
			res.end();
		}
	});
};

/**
 * Returns the assertion with the id specified in the URL
 */
this.getAssertion = function(id, res){
	models.assertion.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting assertion "+err);
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
 * This updates the assertion with id specified in the URL.
 * It will not change the id.
 * On success, it returns the _id value (just like on create)
 */
this.updateAssertion = function(id, data, res){
	models.assertion.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting assertion "+err);
			general.send500(res);
		} else if(docs) {
			for(var e in data){
				//Make sure not to change _id
				if(e != '_id'){
					docs[e] = data[e];
				}
			}
			docs.updatedDate = new Date();
			docs.save(function(err){
				if(err){
					general.send500(res);
				} else {
					res.json({id:docs._id});
					res.end();
				}
			});			
		} else {
			general.send404(res);
		}
	});
};

/**
 * Deletes the assertion with the given ID
**/
this.deleteAssertion = function(id, data, res) {
	models.assertion.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting assertion '+id, err);
			res.status('500');
			res.json({error:'Invalid assertion '+id});
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

this.deleteAssertions = function(res){
	models.assertion.find({}, function(err, docs){
		for(var i = 0; i < docs.length; i++){
			docs[i].remove();
		}
		res.json({status:'ok'});
		res.end();
	});
};
