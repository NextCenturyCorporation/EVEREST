var TargetAssertionService = require("../database/target_assertion.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var targetAssertionService = new TargetAssertionService(models, io, logger);
	
	/**
	 * List all Target Assertions
	 */
	app.get("/target-assertion/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of all Target Assertions");
		}
		
		targetAssertionService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Target Assertions", err);
				responseHandler.send500(res, "Error listing Target Assertion");
			} else {
				targetAssertionService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Target Assertions: " + err, err);
						responseHandler.send500(res, "Error getting count of Target Assertions");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});
	
	/**
	 * List all indexes for the Target Assertion object
	 */
	app.get("/target-assertion/indexes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for Target Assertion");
		}
		
		targetAssertionService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes of Target Assertions");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	}); 
		
	/**
	 * List createdDate for all of the Target Assertions (in milliseconds)
	 */
	app.get("/target-assertion/dates/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of dates for all Target Assertions");
		}
		
		targetAssertionService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Target Assertions");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	}); 
	
	/**
	 * List the _id and name of all Target Assertions
	 */
	app.get("/target-assertion/names/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Target Assertion name list");
		}
		
		var params = {};
		targetAssertionService.listFields(params, "_id name", function(err, docs) {
			if (err) {
				logger.error("Error listing Target Assertion id - name ", err);
				responseHandler.send500(res, "Error listing Target Assertion id - name");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});

	/**
	 * Create a new Target Assertion
	 */
	app.post("/target-assertion/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Target Assertion", req.body);
		}
		
		targetAssertionService.create(req.body, function(err, val, newTargetAssertion) {
			if (err) {
				logger.error("Error saving Target Assertion", err);
				responseHandler.send500(res, "Error saving Target Assertion " + err);
			} else if (!val.valid) {
				logger.info("Invalid Target Assertion " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Target Assertion " + JSON.stringify(val.errors));
			} else {
				logger.info("Target Assertion saved " + JSON.stringify(newTargetAssertion));
				res.jsonp({_id: newTargetAssertion._id});
				res.end();
			}
		});
	});

	/**
	 * Review Target Assertion with specified id
	 * "/target-assertion/:{param_name}(contents to go in param_name)"
	 */
	app.get("/target-assertion/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Target Assertion " + req.params.id);
		}
		
		targetAssertionService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Target Assertion", err);
				responseHandler.send500(res, "Error getting Target Assertion " + err);
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update Target Assertion with specified id
	 */
	app.post("/target-assertion/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Target Assertion " + req.params.id);
		}
		
		targetAssertionService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Target Assertion", err);
				responseHandler.send500(res, "Error updating Target Assertion " + err);
			} else if (!val.valid) {
				logger.info("Invalid Target Assertion " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Target Assertion " + JSON.stringify(val.errors));
			} else {
				logger.info("Target Assertion updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete Target Assertion with specified id
	 */
	app.del("/target-assertion/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting Target Assertion with id: " + req.params.id);
		}
		
		targetAssertionService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Target Assertions
	 */
	app.del("/target-assertion/", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all Target Assertions");
		}
		
		targetAssertionService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};