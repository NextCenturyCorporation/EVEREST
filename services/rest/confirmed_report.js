/*global require*/
// Identify require as a global function/keyword for JSHint

var ConfirmedReportService = require('../database/confirmed_report.js');
var responseHandler = require('../wizard_service');

var ConfirmedReportRoutes = module.exports = function(app, models, io, log) {
	var me = this;

	me.app = app;
	me.models = models;
	me.logger = log;
	me.io = io;

	var confirmedReportService = new ConfirmedReportService(me.models, me.io, me.logger);

	me.app.get('/confirmed-report/?', function(req, res){
		if(me.logger.DO_LOG){
			me.logger.info('Request for a list of all confirmed reports');
		}

		//TODO params
		confirmedReportService.list({}, function(err, reports) {
			if(err) {
				var errMsg = "Error attempting to list confirmed reports";
				me.logger.error("confirmedReport: " + errMsg, err);
				responseHandler.send500(res, errMsg);
			} else {
				res.json(reports);
				res.end();
			}
		});
	});

	me.app.get('/confirmed-report/:id([0-9a-f]+)', function(req,res){     
		if(me.logger.DO_LOG ){
			me.logger.info('Request for confirmed report ' + req.params.id);
		}

		confirmedReportService.get(req.params.id, function(err, report) {
			if(err) {
				var errMsg = "Error attempting to get confirmed report";
				me.logger.error("confirmedReport: " + errMsg, err);
				responseHandler.send500(res, errMsg);
			} else {
				res.json(report);
				res.end();
			}
		});
	});

	me.app.del('/confirmed-report/:id([0-9a-f]+)', function(req,res){
		if(me.logger.DO_LOG){
			me.logger.info('Deleting confirmed report with id: ' + req.params.id);
		}

		var id = req.params.id;

		confirmedReportService.delete({_id: id}, function(err, count) {
			if(err) {
				var errMsg = "Error attempting to delete confirmed report";
				me.logger.error("confirmedReport: " + errMsg, err);
				responseHandler.send500(res, errMsg);
			} else {
				res.json({deleted_count: count, _id: id});
				res.end();
			}
		});
	});
	
	//Delete all reporters
	me.app.del('/confirmed-report/?', function(req, res){
		if(me.logger.DO_LOG){
			me.logger.info('Deleting all confirmed report entries');
		}
		confirmedReportService.delete({}, function(err, count) {
			if(err) {
				var errMsg = "Error attempting to delete confirmed reports";
				me.logger.error("confirmedReport: " + errMsg, err);
				responseHandler.send500(res, errMsg);
			} else {
				res.json({deleted_count: count});
				res.end();
			}
		});
	});

	me.app.post('/confirmed-report/?', function(req,res){
		if(me.logger.DO_LOG){
			me.logger.info('Receiving new confirmed report', req.body);
		}

		var data = req.body;

		if(data.assertions) {
			data.assertions = data.assertions.split(',');
		}

		confirmedReportService.create(data, function(err, newConfirmedReport) {
			if(err) {
				var errMsg = "Error attempting to create confirmed report";
				me.logger.error("confirmedReport: " + errMsg, err);
				responseHandler.send500(res, errMsg);
			} else {
				res.json({_id: newConfirmedReport._id});
				res.end();
			}
		});
	});

	/*
	//TODO

	me.app.get('/confirmed-report/full/?', function(req, res){
		if(me.logger.DO_LOG){
			me.logger.info('Request for a list of all confirmed reports');
		}
		confirmedReportService.listFlattenedRequest(req.params, res);
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
	});*/
};