var Event_Service = require("../database/event.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var eventService = new Event_Service(models, io, logger);

	/**
	 * List all Events
	 */
	app.get("/event/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Events");
		}
		
		eventService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Events", err);
				responseHandler.send500(res, "Error listing Events " + err);
			} else {
				eventService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Event: " + err, err);
						responseHandler.send500(res, "Error getting count of Events");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}	
		});
	});

	app.get('/event/tags/?', function(req, res){
		if (logger.DO_LOG) {
			logger.info("Request for list of tags for the Event object");
		}
		
		eventService.getTags(function(err, tags) {
			if (!tags) {
				responseHandler.send500(res, "Error getting tags for the Event object");
			} else {
				res.jsonp(tags);
				res.end();
			}
		});
	});
		
	/**
	 * List all indexes for the event object
	 */
	app.get("/event/indexes/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the Event object");
		}
		
		eventService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes for the Event object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});
	
	/**
	 * List createdDate for all of the Events (in milliseconds)
	 */
	app.get("/event/dates/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of dates for all Event");
		}
		
		eventService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Event");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	/**
	 * List the _id and name of all Events
	 */
	app.get("/event/names/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Event name list");
		}
		
		var params = {};
		eventService.listFields(params, "_id name", function(err, docs) {
			if (err) {
				logger.error("Error listing Event id - name ", err);
				responseHandler.send500(res, "Error listing Event id - name");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});

	/**
	 * Create a new event
	 */
	app.post("/event/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Event ", req.body);
		}
		
		eventService.create(req.body, function(err, val, newEvent) {
			if (err) {
				logger.error("Error saving Event", err);
				responseHandler.send500(res, "Error saving Event " + err);
			} else if (!val.valid) {
				logger.info("Invalid Event " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Event " + JSON.stringify(val.errors));
			} else {
				logger.info("Event saved " + JSON.stringify(newEvent));
				res.jsonp({_id: newEvent._id});
				res.end();
			}
		});
	});

	/**
	 * Review a event with specified id
	 * /event/:{param-name}(contents to go in param_name)
	 */
	app.get("/event/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Event " + req.params.id);
		}
		
		eventService.get(req.params.id, function(err, docs){
			if (err) {
				logger.error("Error getting Event ", err);
				responseHandler.send500(res, "Error getting Event");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update event with specified id
	 */
	app.post("/event/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Event " + req.params.id);
		}
		
		eventService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Event", err);
				responseHandler.send500(res, "Error updating Event " + err);
			} else if (!val.valid) {
				logger.info("Invalid Event " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Event " + JSON.stringify(val.errors));
			} else {
				logger.info("Event updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete event with specified id
	 */
	app.del("/event/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting Events with id: " + req.params.id);
		}
		
		eventService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Deletes all Events 
	 */
	app.del("/event/", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all Events");
		}
		
		eventService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};