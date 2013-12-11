var TargetEventService = require("../database/target_event.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var targetEventService = new TargetEventService(models, io, logger);

	/**
	 * List all Target Events
	 */
	app.get("/target-event/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for al list of all Target Events");
		}
		
		targetEventService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Target Events", err);
				responseHandler.send500(res, "Error listing Target Events");
			} else {
				targetEventService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Target Event: " + err, err);
						responseHandler.send500(res, "Error getting count of Target Events");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}	
		});
	});
		
	/**
	 * List all indexes for the Target Event object
	 */
	app.get("/target-event/indexes/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the Target Event object");
		}
		
		targetEventService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes for the Target Event object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});
	
	/**
	 * List createdDate for all of the Target Events (in milliseconds)
	 */
	app.get("/target-event/dates/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of dates for all Target Event");
		}
		
		targetEventService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Target Event");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	/**
	 * List the _id and name of all Target Events
	 */
	app.get("/target-event/names/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Target Event name list");
		}
		
		var params = {};
		targetEventService.listFields(params, "_id name", function(err, docs) {
			if (err) {
				logger.error("Error listing Target Event id - name ", err);
				responseHandler.send500(res, "Error listing Target Event id - name");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});

	/**
	 * Create a new Target Event
	 */
	app.post("/target-event/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Target Event ", req.body);
		}
		
		targetEventService.create(req.body, function(err, val, newTargetEvent) {
			if (err) {
				logger.error("Error saving Target Event", err);
				responseHandler.send500(res, "Error saving Target Event " + err);
			} else if (!val.valid) {
				logger.info("Invalid Target Event " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Target Event " + JSON.stringify(val.errors));
			} else {
				logger.info("Target Event saved " + JSON.stringify(newTargetEvent));
				res.jsonp({_id: newTargetEvent._id});
				res.end();
			}
		});
	});

	/**
	 * Review a Target Event with specified id
	 * /target-event/:{param-name}(contents to go in param_name)
	 */
	app.get("/target-event/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Target Event " + req.params.id);
		}
		
		targetEventService.get(req.params.id, function(err, docs){
			if (err) {
				logger.error("Error getting Target Event ", err);
				responseHandler.send500(res, "Error getting Target Event");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update Target Event with specified id
	 */
	app.post("/target-event/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Target Event " + req.params.id);
		}
		
		targetEventService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Target Event", err);
				responseHandler.send500(res, "Error updating Target Event");
			} else if (val && !val.valid) {
				logger.info("Invalid Target Event " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Target Event " + JSON.stringify(val.errors));
			} else {
				logger.info("Target Event updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete Target Event with specified id
	 */
	app.del("/target-event/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting Target Event with id: " + req.params.id);
		}
		
		targetEventService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Deletes all Target Events 
	 */
	app.del("/target-event/", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all Target Event");
		}
		
		targetEventService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};