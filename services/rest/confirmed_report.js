/*global require*/
// Identify require as a global function/keyword for JSHint

var ConfirmedReportService = require('../database/confirmed_report.js');

var ConfirmedReportRoutes = module.exports = function(app, models, log) {
	var me = this;

	me.app = app;
	me.models = models;
	me.logger = log;

	var confirmedReportService = new ConfirmedReportService(models, log);

	me.app.get('/confirmed-report/?', function(req, res){
		if(me.logger.DO_LOG){
			me.logger.info('Request for a list of all confirmed reports');
		}
		confirmedReportService.listRequest(req.params, res);
	});

	me.app.get('/confirmed-report/full/?', function(req, res){
		if(me.logger.DO_LOG){
			me.logger.info('Request for a list of all confirmed reports');
		}
		confirmedReportService.listFlattenedRequest(req.params, res);
	});
	
	me.app.post('/confirmed-report/?', function(req,res){
		if(me.logger.DO_LOG){
			me.logger.info('Receiving new confirmed report', req.body);
		}
		confirmedReportService.createRequest(req.body, res);
	});
	
	me.app.get('/confirmed-report/:id([0-9a-f]+)', function(req,res){     
		if(me.logger.DO_LOG ){
			me.logger.info('Request for confirmed report ' + req.params.id);
		}
		confirmedReportService.getRequest(req.params.id, res);
	});

	me.app.get('/confirmed-report/full/:id([0-9a-f]+)', function(req,res){     
		if(me.logger.DO_LOG ){
			me.logger.info('Request for confirmed report ' + req.params.id);
		}
		confirmedReportService.getFlattenedRequest(req.params.id, res);
	});
	
	me.app.post('/confirmed-report/:id([0-9a-f]+)', function(req,res){
		if(me.logger.DO_LOG){
			me.logger.info('Update confirmed report ' + req.params.id);
		}
		confirmedReportService.updateRequest(req.params.id, req.body, res);
	});
	
	me.app.del('/confirmed-report/:id([0-9a-f]+)', function(req,res){
		if(me.logger.DO_LOG){
			me.logger.info('Deleting confirmed report with id: ' + req.params.id);
		}
		confirmedReportService.deleteRequest(req.params.id, res);
	});
	
	//Delete all reporters
	me.app.del('/confirmed-report/?', function(req, res){
		if(me.logger.DO_LOG){
			me.logger.info('Deleting all confirmed report entries');
		}
		confirmedReportService.deleteAllRequest(req, res);
	});
};