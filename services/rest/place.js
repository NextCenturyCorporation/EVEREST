var PlaceService = require("../database/place.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {	
	var placeService = new PlaceService(models, io, logger);

	/**
	 * List all Places
	 */
	app.get("/place/?", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Request for Place list");
		}
		
		placeService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing places", err);
				responseHandler.send500(res, "Error listing places");
			} else {
				placeService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Place: " + err, err);
						responseHandler.send500(res, "Error getting total number of Places");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});
	
	/**
	 * List all indexes for the Place object
	 */
	app.get("/place/indexes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the Place object");
		}
		
		placeService.getIndexes(req.query, function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting the indexes for the Place object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});
	
	/**
	 * List createdDate for all of the Places (in milliseconds)
	 */
	app.get("/place/dates/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of dates for all Places");
		}
		
		placeService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting the dates for Place");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	/**
	 * Lists the _id and name for all Places
	 */
	app.get("/place/names/?", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for Place name list");
		}
		
		var params = {};
		placeService.listFields(params, "_id name", function(err, docs) {
			if (err) {
				logger.error("Error listing Place id - name", err);
				responseHandler.send500(res, "Error listing Place id - name");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});

	/**
	 * Create a new Place
	 */
	app.post("/place/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new place", req.body);
		}
		
		placeService.create(req.body, function(err, val, newPlace) {
			if (err) {
				logger.error("Error saving Place", err);
				responseHandler.send500(res, "Error saving Place");
			} else if (!val.valid) {
				logger.info("Invalid Place " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Place " + JSON.stringify(val.errors));
			} else {
				logger.info("Place saved " + JSON.stringify(newPlace));
				res.jsonp({_id: newPlace._id});
				res.end();
			}
		});				
	});

	/**
	 * Review a Place specified by id
	 * /place/:{param_name}(contents go in param_name)
	 */
	app.get("/place/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Place " + req.params.id);
		}
		
		placeService.get(req.params.id, function(err, docs){
			if (err) {
				logger.error("Error getting Place", err);
				responseHandler.send500(res, "Error getting Place");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	/**
	 * Review a Place specified by name
	 * /place/:{param_name}(contents go in param_name)
	 */
	app.get("/place/:name", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Place with name " + req.params.name);
		}

		placeService.findWhere({name: req.params.name}, function(err, docs) {
			if (err) {
				logger.error("Error listing Place with name " + req.params.name, err);
				responseHandler.send500(res, "Error listing Place by name");
			} else if (docs) {
				res.jsonp(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update a Place specified by id
	 */
	app.post("/place/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Updating Place with id " + req.params.id);
		}
		
		placeService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Place ", err);
				responseHandler.send500(res, "Error updating Place");
			} else if (val && !val.valid) {
				logger.info("Invalid Place " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Place");
			} else {
				logger.info("Place updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete a single Place with specified id
	 */
	app.del("/place/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting Place with id: " + req.params.id);
		}
		
		placeService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Places
	 */
	app.del("/place/", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all Places");
		}
		
		placeService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};