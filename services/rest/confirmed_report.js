/*global require*/
// Identify require as a global function/keyword for JSHint

var ConfirmedReportService = require('../database/confirmed_report.js');
var responseHandler = require('../wizard_service');

module.exports = function(app, models, io, log) {
	var me = this;

	me.app = app;
	me.models = models;
	me.logger = log;
	me.io = io;

	var confirmedReportService = new ConfirmedReportService(me.models, me.io, me.logger);

	//list
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

	//get
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

	//delete
	me.app.del('/confirmed-report/:id([0-9a-f]+)', function(req,res){
		if(me.logger.DO_LOG){
			me.logger.info('Deleting confirmed report with id: ' + req.params.id);
		}

		var id = req.params.id;

		confirmedReportService.del({_id: id}, function(err, count) {
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
	
	//Delete all
	me.app.del('/confirmed-report/?', function(req, res){
		if(me.logger.DO_LOG){
			me.logger.info('Deleting all confirmed report entries');
		}
		confirmedReportService.del({}, function(err, count) {
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

	//create
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

	me.app.post('/confirmed-report/:id([0-9a-f]+)', function(req,res){
		if(me.logger.DO_LOG){
			me.logger.info('Update confirmed report ' + req.params.id);
		}

		var data = req.body;

		if(data.assertions) {
			data.assertions = data.assertions.split(',');
		}

		confirmedReportService.update(req.params.id, data, function(err, newConfirmedReport) {
			if(err) {
				var errMsg = "Error attempting to update confirmed report";
				me.logger.error("confirmedReport: " + errMsg, err);
				responseHandler.send500(res, errMsg);
			} else {
				res.json({_id: newConfirmedReport._id});
				res.end();
			}
		});
	});

	me.app.get('/confirmed-report/full/?', function(req, res){
		if(me.logger.DO_LOG){
			me.logger.info('Request for a list of all confirmed reports flattened');
		}
		confirmedReportService.listFlattenedRequest(req.params, res);

		confirmedReportService.listFlattened(req.query, function(err, reports) {
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

	me.app.get('/confirmed-report/full/:id([0-9a-f]+)', function(req,res){     
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
};