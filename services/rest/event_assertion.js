var EventAssertionService = require("../database/event_assertion.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var eventAssertionService = new EventAssertionService(models, io, logger);
	
	/**
	 * List all Event Assertions
	 */
	app.get("/event-assertion/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of all Event Assertions");
		}
		
		eventAssertionService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Event Assertions", err);
				responseHandler.send500(res, "Error listing Event Assertion");
			} else {
				eventAssertionService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Event Assertions: " + err, err);
						responseHandler.send500(res, "Error getting count of Event Assertions");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});
	
	/**
	 * List all indexes for the Event Assertion object
	 */
	app.get("/event-assertion/indexes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for Event Assertion");
		}
		
		eventAssertionService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes of Event Assertions");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	}); 
		
	/**
	 * List createdDate for all of the Event Assertions (in milliseconds)
	 */
	app.get("/event-assertion/dates/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of dates for all Event Assertions");
		}
		
		eventAssertionService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Event Assertions");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	}); 
	
	/**
	 * List the _id and name of all Event Assertions
	 */
	app.get("/event-assertion/names/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Event Assertion name list");
		}
		
		var params = {};
		eventAssertionService.listFields(params, "_id name", function(err, docs) {
			if (err) {
				logger.error("Error listing Event Assertion id - name ", err);
				responseHandler.send500(res, "Error listing Event Assertion id - name");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});

	/**
	 * Create a new Event Assertion
	 */
	app.post("/event-assertion/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Event Assertion", req.body);
		}
		
		eventAssertionService.create(req.body, function(err, val, newEventAssertion) {
			if (err) {
				logger.error("Error saving Event Assertion", err);
				responseHandler.send500(res, "Error saving Event Assertion " + err);
			} else if (!val.valid) {
				logger.info("Invalid Event Assertion " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Event Assertion " + JSON.stringify(val.errors));
			} else {
				logger.info("Event Assertion saved " + JSON.stringify(newEventAssertion));
				res.jsonp({_id: newEventAssertion._id});
				res.end();
			}
		});
	});

	/**
	 * Review Event Assertion with specified id
	 * "/event-assertion/:{param_name}(contents to go in param_name)"
	 */
	app.get("/event-assertion/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Event Assertion " + req.params.id);
		}
		
		eventAssertionService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Event Assertion", err);
				responseHandler.send500(res, "Error getting Event Assertion " + err);
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update Event Assertion with specified id
	 */
	app.post("/event-assertion/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Event Assertion " + req.params.id);
		}
		
		eventAssertionService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Event Assertion", err);
				responseHandler.send500(res, "Error updating Event Assertion " + err);
			} else if (!val.valid) {
				logger.info("Invalid Event Assertion " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Event Assertion " + JSON.stringify(val.errors));
			} else {
				logger.info("Event Assertion updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete Event Assertion with specified id
	 */
	app.del("/event-assertion/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting Event Assertion with id: " + req.params.id);
		}
		
		eventAssertionService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Event Assertions
	 */
	app.del("/event-assertion/", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all Event Assertions");
		}
		
		eventAssertionService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};