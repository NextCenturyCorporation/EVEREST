var AlphaReportService = require("../database/alpha_report.js");
var responseHandler = require("../general_response");
var histogramDataModule = require("../modules/histogramDataModule.js");

module.exports = function(app, models, io, logger) {
	var alphaReportService = new AlphaReportService(models, io, logger);
	var alphaReportHistogram = new histogramDataModule(models.alphaReport);

	/**
	 * List all Alpha Reports
	 */
	app.get("/alpha-report/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Alpha Reports");
		}

		alphaReportService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Alpha Reports", err);
				responseHandler.send500(res, "Error listing Alpha Reports");
			} else {
				alphaReportService.getTotalCount(config, function(err, count) {
					if (err){
						logger.error("Alpha Report: " + err, err);
						responseHandler.send500(res, "Error getting count of Alpha Reports");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});

	/**
	 * List all indexes for the Alpha Report object
	 */
	app.get("/alpha-report/indexes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the Alpha Report object");
		}

		alphaReportService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes for the Alpha Report object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});

	/**
	 * List createdDate for all of the Alpha Reports (in milliseconds)
	 */
	app.get("/alpha-report/dates/?", function(req, res) {
		if (logger.DO_LOG) { 
			logger.info("Request for list of dates for all Alpha Reports");
		}

		alphaReportService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Alpha Reports");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});

	/** 
	 * A mode and base date are passed in, the will return the dates that
	 *  fall within that mode, given the base date
	 */
	app.get("/alpha-report/dates/:mode/:date/?", function(req, res) {
		if (logger.DO_LOG) { 
			logger.info("Request for list of dates");
		}

		alphaReportHistogram.findDatesByFrequency(req.params.mode, req.params.date, function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Alpha Reports");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	/** 
	 * list the _id and source_id of all Alpha Reports 
	 */
	app.get("/alpha-report/source_ids/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Alpha Report source_id list");
		}
		
		var params = {};
		alphaReportService.listFields(params, "_id source_id", function(err, docs) {
			if (err) {
				logger.error("Error listing alpha report id - source_id", err);
				responseHandler.send500(res, "Error listing alpha report id - source_id");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});
	
	/**
	 * Create a new Alpha Report
	 */
	app.post("/alpha-report/?", function(req,res){
		if (logger.DO_LOG) {
			logger.info("Receiving new Alpha Report ", req.body);
		}
		
		alphaReportService.create(req.body, function(err, val, newAlphaReport) {
			if (err) {
				logger.error("Error saving Alpha Report", err);
				responseHandler.send500(res, "Error saving Alpha Report");
			} else if (!val.valid) {
				logger.info("Invalid Alpha Report " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Alpha Report " + JSON.stringify(val.errors));
			} else {
				logger.info("Alpha Report saved " + JSON.stringify(newAlphaReport));
				res.jsonp({_id: newAlphaReport._id});
				res.end();
			}
		});
	});
	
	/**
	 * Review a Alpha Report specified by id
	 * /alpha-report/:{param_name}(contents go in param_name)
	 */
	app.get("/alpha-report/:id([0-9a-f]+)", function(req,res){
		if (logger.DO_LOG) {
			logger.info("Request for Alpha Report " + req.params.id);
		}
		
		alphaReportService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Alpha Report", err);
				responseHandler.send500(res, "Error getting Alpha Report");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update Alpha Report with specified id
	 */
	app.post("/alpha-report/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Alpha Report " + req.params.id);
		}

		alphaReportService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Alpha Report", err);
				responseHandler.send500(res, "Error updating Alpha Report");
			} else if (val && !val.valid) {
				logger.info("Invalid Alpha Report " + JSON.stringify(val.errors));
				responseHandler.send500(res, " Invalid Alpha Report " + JSON.stringify(val.errors));
			} else {
				logger.info("Alpha Report updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete a single Alpha Report with specified id
	 */
	app.del("/alpha-report/:id([0-9a-f]+)", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Deleting Alpha Report with id: " + req.params.id);
		}
		
		alphaReportService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Alpha Reports
	 */
	app.del("/alpha-report/", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Deleting all Alpha Reports");
		}
		
		alphaReportService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};