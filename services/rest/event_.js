var Event_Service = require("../database/event_.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var event_Service = new Event_Service(models, io, logger);

	/**
	 * List all Event_s
	 */
	app.get("/event_/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Event_s");
		}
		
		event_Service.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Event_s", err);
				responseHandler.send500(res, "Error listing Event_s");
			} else {
				event_Service.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("event_: " + err, err);
						responseHandler.send500(res, "Error getting count of Event_s");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}	
		});
	});
		
	/**
	 * List all indexes for the event_ object
	 */
	app.get("/event_/indexes/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the event_ object");
		}
		
		event_Service.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes for the event_ object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});
	
	/**
	 * List createdDate for all of the Event_s (in milliseconds)
	 */
	app.get("/event_/dates/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of dates for all event_");
		}
		
		event_Service.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for event_");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	/**
	 * List the _id and name of all Event_s
	 */
	app.get("/event_/names/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for event_ name list");
		}
		
		var params = {};
		event_Service.listFields(params, "_id name", function(err, docs) {
			if (err) {
				logger.error("Error listing event_ id - name ", err);
				responseHandler.send500(res, "Error listing event_ id - name");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});

	/**
	 * Create a new event_
	 */
	app.post("/event_/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new event_ ", req.body);
		}
		
		event_Service.create(req.body, function(err, val, newEvent_) {
			if (err) {
				logger.error("Error saving event_", err);
				responseHandler.send500(res, "Error saving event_");
			} else if (!val.valid) {
				logger.info("Invalid event_ " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid event_ " + JSON.stringify(val.errors));
			} else {
				logger.info("Event_ saved " + JSON.stringify(newEvent_));
				res.jsonp({_id: newEvent_._id});
				res.end();
			}
		});
	});

	/**
	 * Review a event_ with specified id
	 * /event_/:{param-name}(contents to go in param_name)
	 */
	app.get("/event_/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for event_ " + req.params.id);
		}
		
		event_Service.get(req.params.id, function(err, docs){
			if (err) {
				logger.error("Error getting event_ ", err);
				responseHandler.send500(res, "Error getting event_");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update event_ with specified id
	 */
	app.post("/event_/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update event_ " + req.params.id);
		}
		
		event_Service.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating event_", err);
				responseHandler.send500(res, "Error updating event_");
			} else if (!val.valid) {
				logger.info("Invalid event_ " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid event_ " + JSON.stringify(val.errors));
			} else {
				logger.info("event_ updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete event_ with specified id
	 */
	app.del("/event_/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting event_ with id: " + req.params.id);
		}
		
		event_Service.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Deletes all Event_s 
	 */
	app.del("/event_/", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all event_");
		}
		
		event_Service.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};