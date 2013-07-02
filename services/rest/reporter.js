var reporterService = require('../database/reporter.js');
var reporterValidation = require('../../models/reporter/model.js');
var revalidator = require('revaliator');

this.load = function(app, io, gcm, logger){
	//list - lists full object
	app.get('/reporter/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for a list of all reporters');
		}
		reporterService.listReporters(res);
	});
	
	//list - lists name and id
	app.get('/reporter/names', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for reporter name list');
		} 
		reporterService.listReporterNames(res);
	});
	
	//Create
	app.post('/reporter/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Receiving new reporter', req.body);
		}
		var validation = revalidator.validate(req.body, reporterValidation);
		if(validation.valid){
			reporterService.createReporter(req.body, res);
		} else { 
			if(logger.DO_LOG){
				logger.info(validation.errors); //dbl check this, seems odd
			}
			res.status(500);
			res.json({error: validation.errors}, req.body);
		}
	});
	
	//Review
	app.get('/reporter/:id([0-9a-f]+)', function(req,res){
		if( 0 && logger.DO_LOG){ //if(!logger.DO_LOG){// ??
			logger.info('Request for reporter ' + req.params.id);
		}
		reporterService.getReporter(req.params.id, res);
	});
	
	//Update
	app.post('/reporter/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Update reporter ' + req.params.id);
		}
		var validation = revalidatior.validate(req.body, reporterValidation);
		if(validation.valid){
			reporterService.updateReporter(req.params.id, req.body, res);
		} else {
			if (logger.DO_LOG){
				logger.info(validation.errors);
			} 
			res.status(500);
			res.json({error: validation.errors});
		}
	});
	
	//Delete
	app.del('/reporter/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Deleting reporter with id: ' + req.params.id);
		}
		reporterService.deleteReporter(req.params.id, res);
	});
	
	app.del('/reporter/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Deleting all reporter entries');
		}
		reporterService.deleteReporters(res);
	});
};