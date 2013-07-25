var assertionService = require('../database/assertion.js');
var validationModel = require('../../models/assertion/model.js');
var bvalidator = require('../../models/assertion/bvalidator.js');
var revalidator = require('revalidator');

this.load = function(app, io, gcm, logger) {
	//list - lists full object
	app.get('/assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for assertion list");
		}
		assertionService.listAssertions(res);
	});
	
	//Create
	app.post('/assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new assertion");
		}
		var assertionVal = revalidator.validate(req.body, validationModel.assertionValidation);

		if (assertionVal.valid) {
			// does the assertion object comply with business validation logic
			bvalidator.validate(req.body, function(bVal) {
				if (bVal.valid) {
					logger.info("Valid assertion");
					assertionService.createAssertion(req.body, res);
				}
				else {
					if(logger.DO_LOG){
						logger.error(bVal.errors);
					}
					res.status(500);
					res.json({error: bVal.errors}, req.body);
				}
			});
			
		}
		else {
			if(logger.DO_LOG){
				logger.info(assertionVal.errors);
			}
			res.status(500);
			res.json({error: assertionVal.errors}, req.body);
		}
	});


	//Review
	app.get('/assertion/:id([0-9a-f]+)', function(req,res){
		if(0 && logger.DO_LOG){
			logger.info("Request for assertion "+req.params.id);
		}
		assertionService.getAssertion(req.params.id, res);
	});
	
	//Update
	app.post('/assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update assertion "+req.params.id);
		}
		var assertionVal = revalidator.validate(req.body, validationModel.assertionValidation);
		if (assertionVal.valid) {
			// does the assertion object comply with business validation logic
			// TODO: May need to address the "already exists" business logic check
			bvalidator.validate(req.body, function(bVal) {
				if (bVal.valid) {
					logger.info("Valid assertion " + JSON.stringify(req.body));
					assertionService.updateAssertion(req.params.id, req.body, res);
				}
				else {
					if(logger.DO_LOG){
						logger.error(bVal.errors);
					}
					res.status(500);
					res.json({error: bVal.errors}, req.body);
				}
			});
			
		}
		else {
			if(logger.DO_LOG){
				logger.info(assertionVal.errors);
			}
			res.status(500);
			res.json({error: assertionVal.errors});
		}
	});
	
	//Delete and individual assertion
	app.del('/assertion/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting assertion with id: " + req.params.id);
		}
		assertionService.deleteAssertion(req.params.id, req.body, res);
	});

	//Delete all assertions
	app.del('/assertion/', function(req, res){
		if(logger.DO_LOG){
			logger.info("Deleting all assertion entries");
		}
		assertionService.deleteAssertions(res);
	});
};
