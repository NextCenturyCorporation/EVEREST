var alphaReportService = require('../database/alpha_report.js');

this.load = function(app, io, gcm, logger){
	
	//list all fields of all alpha reports
	app.get('/alpha_report/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for a list of all alpha reports');
		}
		alphaReportService.listAlphaReports(res);
	});
	
	//list all alpha reports, only showing source_id and id
	app.get('/alpha_report/source_ids/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for alpha report source_id list');
		} 
		alphaReportService.listAlphaReportSourceIds(res);
	});
	
	//Create a single alpha report based on posted information
	app.post('/alpha_report/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Receiving new alpha report', req.body);
		}
		alphaReportService.createAlphaReport(req.body, res);
	});
	
	//Review  '/alpha_report/:{param_name}(contents to go in param_name)'
	app.get('/alpha_report/:id([0-9a-f]+)', function(req,res){     
		if(logger.DO_LOG ){
			logger.info('Request for alpha_report ' + req.params.id);
		}
		alphaReportService.getAlphaReport(req.params.id, res);
	});
	
	//Review all reporters whose source name was source_name (either Twitter or Email)
	app.get('/alpha_report/:source_name(Twitter|Email)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for reporter source of' + req.params.source_name);
		}
		alphaReportService.getAlphaReportBySource(req.params.source_name, res);
	});
	
	//FIXME how does this not colide?
	//Review all reporters whose source id
	app.get('/alpha_report/:source_id([0-9a-zA-Z]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for alpha report with source_id of ' + req.params.source_id);
		}
		alphaReportService.getAlphaReportBySourceId(req.params.source_id, res);
	});
	
	//Update a single alpha report based on the specified id
	app.post('/alpha_report/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Update alpha report ' + req.params.id);
		}
		alphaReportService.updateAlphaReport(req.params.id, req.body, res);
	});
	
	//Delete a single alpha report by the specified id
	app.del('/alpha_report/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Deleting alpha report with id: ' + req.params.id);
		}
		alphaReportService.deleteAlphaReport(req.params.id, res);
	});
	
	//Delete all reporters
	app.del('/alpha_report/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Deleting all alpha report entries');
		}
		alphaReportService.deleteAlphaReports(res);
	});
};