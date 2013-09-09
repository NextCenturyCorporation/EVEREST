var AlphaReportService = require('../database/alpha_report.js');
var general = require('../wizard_service');

module.exports = function(app, models, io, logger) {
	var me = this;

	me.logger = logger;
	me.models = models;
	me.app = app;
	me.io = io;

	var alphaReportService = new AlphaReportService(models, io, logger);

		//list all fields of all alpha reports
	app.get('/alpha-report/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for a list of all alpha reports');
		}
		var params = {};

		alphaReportService.list(params, function(err, docs){
			if(err){
				logger.info("Error listing alpha reports " + err);
				general.send500(res);
			} else {
				res.json(docs);
				res.end();
			}
		});
	});
	
	//list all alpha reports, only showing source_id and id
	app.get('/alpha-report/source_ids/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Request for alpha report source_id list');
		}
		var params = {};

		alphaReportService.listFields(params, "_id source_id", function(err, docs){
			if(err){
				logger.info("Error listing alpha report id - source_id" + err);
				general.send500(res);
			} else {
				res.json(docs);
				res.end();
			}
		});
	});
	
	//Create a single alpha report based on posted information
	app.post('/alpha-report/?', function(req,res){
		if(logger.DO_LOG){
			logger.info('Receiving new alpha report', req.body);
		}
		alphaReportService.create(req.body, function(err, val, newAlphaReport) {
			if(err){
				logger.error('Error saving AlphaReport', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid AlphaReport ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, req.body);
			} else {
				logger.info('AlphaReport saved ' + JSON.stringify(newAlphaReport));
				res.json({_id:newAlphaReport._id});
			}
			res.end();
		});
	});
	
	//Review  '/alpha-report/:{param_name}(contents to go in param_name)'
	app.get('/alpha-report/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG ){
			logger.info('Request for alpha-report ' + req.params.id);
		}
		alphaReportService.getAlphaReport(req.params.id, function(err, docs){
			if(err){
				logger.info('Error getting alpha report ' + err);
				general.send500(res);
			} else if(docs) {
				res.json(docs);
				res.end();
			} else {
				general.send404(res);
			}
		});
	});
	
	//Update a single alpha report based on the specified id
	app.post('/alpha-report/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Update alpha report ' + req.params.id);
		}
		alphaReportService.updateAlphaReport(req.params.id, req.body, function(err, val, updated) {
			if(err){
				logger.error('Error updating AlphaReport', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid AlphaReport ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, req.body);
			} else {
				logger.info('AlphaReport updated ' + JSON.stringify(updated));
				res.json({id:updated._id});
			}
			res.end();
		});
	});
	
	//Delete a single alpha report by the specified id
	app.del('/alpha-report/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info('Deleting alpha report with id: ' + req.params.id);
		}
		alphaReportService.del({_id: req.params.id}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	//Delete all reporters
	app.del('/alpha-report/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Deleting all alpha report entries');
		}
		alphaReportService.del({}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
};

