var Bvalidator = require('../../models/assertion/bvalidator.js');
var revalidator = require('revalidator');

var AlphaReportService = require('./alpha_report.js');
var ReporterService = require('./reporter.js');
var actionEmitter = require('../action_emitter.js');

module.exports = function(models, io, logger) {
	var me = this;

	var validationModel = models.assertionValidation;
	var services = {
		assertionService: me,
		alphaReportService: new AlphaReportService(models, io, logger),
		reporterService: ReporterService
	};
	var bvalidator = new Bvalidator(services, logger);

	/**
	 * Returns a list of all the assertions
	 */
	me.listAssertions = function(res){
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
	me.createAssertion = function(data, res){
		me.saveAssertion(data, function(err, val, newAssertion) {
			if(err){
				logger.error('Error saving assertion', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid assertion ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('Assertion saved ' + JSON.stringify(newAssertion));
				res.json({id:newAssertion._id});
			}
			res.end();
		});
	};

	/**
	 * saveAssertion is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of assertion data
	 * 
	 * saveAssertion calls the validateAssertion module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form of  function(err, valid object, assertion object)
	 */
	me.saveAssertion = function(data, saveCallback) {
		me.validateAssertion(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid assertion");
				var newAssertion = new models.assertion(data);
				newAssertion.createdDate = new Date();
				newAssertion.updatedDate = new Date();
				newAssertion.save(function(err){
					if(err){
						logger.error('Error saving assertion ', err);
					} else {
						actionEmitter.saveAssertion({data: newAssertion});
					}
					saveCallback(err, valid, newAssertion);
				});
			}
			else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateAssertion validates an assertion object against the assertion semantic rules
	 * and the business rules associated with an assertion
	 *
	 * validateAssertion calls the JSON validation module  revalidator and
	 * calls the business validation module bvalidator for the assertion object

	 * data is the object being validated
	 * 
	 * valCallback takes the form of  function(valid structure)
	 */
	me.validateAssertion = function(data, valCallback) {
		// is the JSON semantically valid for the location object?
		var valid = revalidator.validate(data, validationModel);
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
	 * Returns the assertion with the id specified in the URL
	 */
	me.getAssertion = function(id, res){
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
	 * readAssertionByProperty is a generic read method to return all of
	 * documents that have a property value that matches.
	 * 
	 * The readCallback should be function(err, docs)
	 */
	me.readAssertionByProperty = function(property, value, readCallback){
		if ( (property !== undefined) && (value !== undefined) ) {
			var query = models.assertion.find({});
			query.where(property, value);
			query.exec(readCallback);
		}
	};

	/**
	 * readAssertionByObject is a generic read method for assertion
	 * It will attempt to find an exact match(es) for the object provided.
	 * 
	 * Note: the incoming object can be a subset or superset of the actual object.
	 * 
	 * The readCallback should be function(err, docs)
	 */
	me.readAssertionByObject = function(object, readCallback){
		if ( object !== undefined ) {
			var query = models.assertion.find({});
			for (var key in object) {
				if (object.hasOwnProperty(key)) {
					query.where(key, object[key]);
				}
			}
			query.exec(readCallback);
		}
	};


	/**
	 * This updates the assertion with id specified in the URL.
	 * It will not change the id.
	 * On success, it returns the _id value (just like on create)
	 */
	me.updateAssertion = function(id, data, res){
		me.updateAssertionX(id, data, function(err, val, updated) {
			if(err){
				logger.error('Error updating assertion', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid assertion ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('Assertion updated ' + JSON.stringify(updated));
				res.json({id:updated._id});
			}
			res.end();
		});
	};

	/**
	 * updateAssertionX calls the validateAssertion then updates the object
	 * 
	 * callback takes the form of  function(err, valid object, Assertion object)
	 */
	me.updateAssertionX = function(id, data, updCallback) {
		me.validateAssertion(data, function(valid){
			if (valid.valid) {
				models.assertion.findById(id, function(err, docs){
					if(err) {
						logger.info("Error getting assertion "+err);
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
						valid.errors = {expected: id, message: "Assertion not found"};
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
	 * Deletes the assertion with the given ID
	**/
	me.deleteAssertion = function(id, data, res) {
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

	me.deleteAssertions = function(res){
		models.assertion.find({}, function(err, docs){
			for(var i = 0; i < docs.length; i++){
				docs[i].remove();
			}
			res.json({status:'ok'});
			res.end();
		});
	};
};