/*global require*/
// Identify require as a global function/keyword for JSHint

var ConfirmedReportService = require("../database/confirmed_report.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var confirmedReportService = new ConfirmedReportService(models, io, logger);

	app.get("/confirmed-report/?", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Confirmed Reports");
		}

		confirmedReportService.list(req.query, function(err, docs, config) {
			if(err) {
				logger.error("Error listing Confirmed Reports ", err);
				responseHandler.send500(res, "Error listing Confirmed Reports");
			} else {
				confirmedReportService.getTotalCount(config, function(err, count){
					if (err) {
						logger.error("Confirmed Report: " + err, err);
						responseHandler.send500(res, "Error getting count of Confirmed Reports");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});
	
	app.get("/confirmed-report/indexes", function(req, res) {
		if(logger.DO_LOG){
			logger.info("Request for list of indexes for Confirmed Report");
			
			confirmedReportService.getIndexes(function(indexes) {
				if (!indexes) {
					responseHandler.send500(res, "Error getting indexes of Confirmed Reports");
				} else {
					res.jsonp(indexes);
					res.end();
				}
			});
		}
	});
	
	app.get("/confirmed-report/dates", function(req, res) {
		if (logger.DO_LOG) { 
			logger.info("Request for list of dates");
		}
		
		confirmedReportService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates of Confirmed Reports");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});


	/**
	 * Create a new Confirmed Report
	 */
	app.post("/confirmed-report/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Confirmed Report", req.body);
		}

		var data = req.body;
		if (data.assertions) {
			data.assertions = data.assertions.split(",");
		}

		confirmedReportService.create(data, function(err, val, newConfirmedReport) {
			if (err) {
				logger.error("Error saving Confirmed Report", err);
				responseHandler.send500(res, "Error saving Confirmed Report");
			} else if ( !val.valid ){
				logger.info("Invalid Confirmed Report " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Confirmed Report");
			} else {
				logger.info("Confirmed Report saved " + JSON.stringify(newConfirmedReport));
				res.jsonp({_id: newConfirmedReport._id});
				res.end();
			}
		});
	});
	
	/**
	 * "/confirmed-report/:{param_name}(contents go in param_name)
	 * Review Confirmed Report by id
	 */
	app.get("/confirmed-report/:id([0-9a-f]+)", function(req, res) {     
		if (logger.DO_LOG ) {
			logger.info("Request for Confirmed Report " + req.params.id);
		}
		console.log(req.params.id);
		confirmedReportService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Confirmed Report", err);
				responseHandler.send500(res, "Error getting Confirmed Report");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});


	/**
	 * Update Confirmed Report by id
	 */
	app.post("/confirmed-report/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Confirmed Report " + req.params.id);
		}

		var data = req.body;
		if (data.assertions) {
			data.assertions = data.assertions.split(",");
		}

		confirmedReportService.update(req.params.id, data, function(err, val, newConfirmedReport) {
			if (err) {
				logger.error("Error updating Confirmed Report", err);
				responseHandler.send500(res, "Error updating Confirmed Report");
			} else if (val && !val.valid) {
				logger.info("Invalid Confirmed Report " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Confirmed Report");
			} else {
				res.jsonp({_id: newConfirmedReport._id});
				res.end();
			}
		});
	});

	app.get("/confirmed-report/full/?", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Confirmed Reports flattened");
		}
		//confirmedReportService.listFlattenedRequest(req.params, res);

		confirmedReportService.listFlattened(req.query, function(err, docs) {
			if (err) {
				logger.error("Error listing flattened Confirmed Reports", err);
				responseHandler.send500(res, "Error listing flattened Confirmed Reports");
			} else if (docs) {
				res.jsonp(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	app.get("/confirmed-report/full/:id([0-9a-f]+)", function(req,res){     
		if (logger.DO_LOG ){
			logger.info("Request for flattened Confirmed Report " + req.params.id);
		}
		
		confirmedReportService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting flattened Confirmed Report", err);
				responseHandler.send500(res, "Error getting flattened Confirmed Report");
			} else if (docs) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	
	/**
	 * Delete a single Confirmed Report with specified id
	 */
	app.del("/confirmed-report/:id([0-9a-f]+)", function(req,res){
		if (logger.DO_LOG) {
			logger.info("Deleting Confirmed Report with id: " + req.params.id);
		}

		confirmedReportService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	//Delete all
	app.del("/confirmed-report/?", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Deleting all Confirmed Report entries");
		}
		
		confirmedReportService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};