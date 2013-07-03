var reporterService = require('../database/reporter.js');
var validationModel = require('../../models/reporter/model.js');
var revalidator = require('revalidator');

this.load = function(app, io, gcm, logger){
	
	//list all fields of all reporters
	app.get('/reporter/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for a list of all reporters');
		}
		reporterService.listReporters(res);
	});
	
	//list all reporters, only showing name and id
	app.get('/reporter/names', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for reporter name list');
		} 
		reporterService.listReporterNames(res);
	});
	
	//Create a single reporter based on posted information
	app.post('/reporter/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Receiving new reporter', req.body);
		}
		var validation = revalidator.validate(req.body, validationModel.reporterValidation);
		if(validation.valid){
			reporterService.createReporter(req.body, res);
		} else { 
			if(logger.DO_LOG){
				logger.info(validation.errors); 
			}
			res.status(500);
			res.json({error: validation.errors}, req.body);
			console.log(validation.errors);
		}
	});
	
	//Review  '/reporter/:{param_name}(contents to go in param_name)'
	app.get('/reporter/:id([0-9a-f]+)', function(req,res){     
		if(logger.DO_LOG ){
			logger.info('Request for reporter ' + req.params.id);
		}
		reporterService.getReporter(req.params.id, res);
	});
	
	//Review all reporters whose source name was source_name (either Twitter or Email)
	app.get('/reporter/:source_name(Twitter|Email)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for reporter source of' + req.params.source_name);
		}
		reporterService.getReporterBySource(req.params.source_name, res);
	});
	
	//Update a single reporter based on the specified id
	app.post('/reporter/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Update reporter ' + req.params.id);
		}
		var validation = revalidator.validate(req.body, validationModel.reporterValidation);
		if(validation.valid){
			logger.info(req.body);
			reporterService.updateReporter(req.params.id, req.body, res);
		} else {
			if (logger.DO_LOG){
				logger.info(validation.errors);
			} 
			res.status(500);
			res.json({error: validation.errors});
		}
	});
	
	//Delete a single reporter by the specified id
	app.del('/reporter/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Deleting reporter with id: ' + req.params.id);
		}
		reporterService.deleteReporter(req.params.id, res);
	});
	
	//Delete all reporters
	app.del('/reporter/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Deleting all reporter entries');
		}
		reporterService.deleteReporters(res);
	});
};