var assertionService = require('../database/assertion.js');
var validationModel = require('../../models/assertion/model.js');
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
		var assertionVal = revalidator.validate(req.body,
			validationModel.assertionValidation);

		if (assertionVal.valid) {
			assertionService.createAssertion(req.body, res);
		}
		else {
			if(logger.DO_LOG){
				logger.info(assertionVal.errors);
			}
			res.status(500);
			res.json({error: assertionVal.errors}, req.body);
		}
	});
	
	//Update
	app.post('/assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update assertion "+req.params.id);
		}
		var assertionVal = revalidator.validate(req.body,
			validationModel.assertionValidation);

		if (assertionVal.valid) {
			assertionService.updateAssertion(req.params.id, req.body, res);
		}
		else {
			if(logger.DO_LOG){
				logger.info(assertionVal.errors);
			}
			res.status(500);
			res.json({error: assertionVal.errors});
		}
	});
	
	//Delete (by id)
	app.del('/assertion/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting assertion with id: " + req.params.id);
		}
		assertionService.deleteAssertion(req.params.id, req.body, res);
	});
};
