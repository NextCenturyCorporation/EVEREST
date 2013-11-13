var ReporterService = require("../database/reporter.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger){
	var reporterService = new ReporterService(models, io, logger);
	
	/**
	 * List all Reporters
	 */
	app.get("/reporter/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Reporters");
		}

		reporterService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Reporters", err);
				responseHandler.send500(res, "Error listing Reporters");
			} else {
				reporterService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Reporter: " + err, err);
						responseHandler.send500(res, "Error getting count of Reporters");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});

	/**
	 * List all indexes for the Reporter object
	 */
	app.get("/reporter/indexes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the Reporter object");
		}

		reporterService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes for the Reporter object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});
	
	/**
	 * List createdDate for all of the Reporters (in milliseconds)
	 */
	app.get("/reporter/dates/?", function(req, res) {
		if (logger.DO_LOG) { 
			logger.info("Request for list of dates for all Reporters");
		}
		
		reporterService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Reporters");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
		
	/** 
	 * list the _id and name of all Reporters 
	 */
	app.get("/reporter/names/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Reporter name list");
		} 
		
		var params = {};
		reporterService.listFields(params, "_id name", function(err, docs) {
			if (err) {
				logger.error("Error listing Reporter id - name", err);
				responseHandler.send500(res, "Error listing Reporter id - name");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});
	
	/** 
	 * list the _id and source_id of all Reporters 
	 */
	app.get("/reporter/source_ids/?", function(req,res){
		if (logger.DO_LOG) {
			logger.info("Request for Reporter source_id list");
		}
		
		var params = {};
		reporterService.listFields(params, "_id source_id", function(err, docs) {
			if (err) {
				logger.error("Error listing Reporter id - source_id", err);
				responseHandler.send500(res, "Error listing Reporter id - source_id");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});
	
	/**
	 * List all Reporters whose source name was source_name (either Twitter, Email or RSS)
	 */
	app.get("/reporter/:source_name(Twitter|Email|RSS)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Reporter source of " + req.params.source_name);
		}
		
		reporterService.findWhere({source_name: req.params.source_name}, function(err, docs) {
			if (err) {
				logger.error("Error listing Reporters with source_name " + req.params.source_name, err);
				responseHandler.send500(res);
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});
	
	/**
	 * Create a new Reporter
	 */
	app.post("/reporter/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Reporter ", req.body);
		}
		
		reporterService.create(req.body, function(err, val, newReporter) {
			if (err) {
				logger.error("Error saving Reporter", err);
				responseHandler.send500(res, "Error saving Reporter");
			} else if (!val.valid) {
				logger.info("Invalid Reporter " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Reporter " + JSON.stringify(val.errors));
			} else {
				logger.info("Reporter saved " + JSON.stringify(newReporter));
				res.jsonp({_id: newReporter._id});
				res.end();
			}
		});
	});
	
	/**
	 * Review a Reporter by specified id
	 * "/reporter/:{param_name}(contents to go in param_name)"
	 */
	app.get("/reporter/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Reporter " + req.params.id);
		}
		
		reporterService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Reporter", err);
				responseHandler.send500(res);
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update Reporter with specified id
	 */
	app.post("/reporter/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Reporter " + req.params.id);
		}

		reporterService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Reporter", err);
				responseHandler.send500(res, "Error updating Reporter");
			} else if (val && !val.valid) {
				logger.info("Invalid Reporter " + JSON.stringify(val.errors));
				responseHandler.send500(res, " Invalid Reporter " + JSON.stringify(val.errors));
			} else {
				logger.info("Reporter updated " + JSON.stringify(updated));
				res.json({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete a single Reporter with specified id
	 */
	app.del("/reporter/:id([0-9a-f]+)", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Deleting Reporter with id: " + req.params.id);
		}
		
		reporterService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Reporters
	 */
	app.del("/reporter/", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all Reporters");
		}
		
		reporterService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};