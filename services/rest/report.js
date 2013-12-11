/*global require*/
// Identify require as a global function/keyword for JSHint

var ReportService = require("../database/report.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var reportService = new ReportService(models, io, logger);

	/**
	 * List all Reports 
	 */
	app.get("/report/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Reports");
		}

		reportService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Reports", err);
				responseHandler.send500(res, "Error listing Reports");
			} else {
				reportService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Report: " + err, err);
						responseHandler.send500(res, "Error getting count of Reports");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});
	
	/**
	 * List all indexes for the Confirmed Report object
	 */
	app.get("/report/indexes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the Report object");
		}

		reportService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes for the Report object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
 	});
	
	/**
	 * List createdDate for all of the Reports (in milliseconds)
	 */
	app.get("/report/dates/?", function(req, res) {
		if (logger.DO_LOG) { 
			logger.info("Request for list of dates for all Reports");
		}
		
		reportService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Reports");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});

	/**
	 * Create a new Confirmed Report
	 */
	app.post("/report/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Report", req.body);
		}

		var data = req.body;
		if (data.assertions) {
			data.assertions = data.assertions.split(",");
		}

		reportService.create(data, function(err, val, newReport) {
			if (err) {
				logger.error("Error saving Report", err);
				responseHandler.send500(res, "Error saving Report " + err);
			} else if ( !val.valid ){
				logger.info("Invalid Report " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Report " + JSON.stringify(val.errors));
			} else {
				logger.info("Report saved " + JSON.stringify(newReport));
				res.jsonp({_id: newReport._id});
				res.end();
			}
		});
	});
	
	/**
	 * Review a Report specified by id
	 * /confirmed-report/:{param_name}(contents go in param_name)
	 */
	app.get("/report/:id([0-9a-f]+)", function(req, res) {     
		if (logger.DO_LOG ) {
			logger.info("Request for Report " + req.params.id);
		}

		reportService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Report", err);
				responseHandler.send500(res, "Error getting Report");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	/**
	 * Update Report with specified id
	 */
	app.post("/report/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Report " + req.params.id);
		}

		var data = req.body;
		if (data.assertions) {
			data.assertions = data.assertions.split(",");
		}

		reportService.update(req.params.id, data, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Report", err);
				responseHandler.send500(res, "Error updating Report " + err);
			} else if (val && !val.valid) {
				logger.info("Invalid Report " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Report " + JSON.stringify(val.errors));
			} else {
				logger.info("Report updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});

	/**
	 * 
	 */
	app.get("/report/full/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Reports flattened");
		}
		//reportService.listFlattenedRequest(req.params, res);

		reportService.listFlattened(req.query, function(err, docs) {
			if (err) {
				logger.error("Error listing flattened Reports", err);
				responseHandler.send500(res, "Error listing flattened Reports");
			} else if (docs) {
				res.jsonp(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	/**
	 * 
	 */
	app.get("/report/full/:id([0-9a-f]+)", function(req, res) {     
		if (logger.DO_LOG) {
			logger.info("Request for flattened Report " + req.params.id);
		}
		
		reportService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting flattened Report", err);
				responseHandler.send500(res, "Error getting flattened Report");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Delete a single Report with specified id
	 */
	app.del("/report/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting Report with id: " + req.params.id);
		}

		reportService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Reports
	 */
	app.del("/report/", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Deleting all Report entries");
		}
		
		reportService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};