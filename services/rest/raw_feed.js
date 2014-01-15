var RawFeedService = require("../database/raw_feed.js");
var responseHandler = require("../general_response");
var histogramDataModule = require("../modules/histogramDataModule.js");

module.exports = function(app, models, io, logger) {
	var rawFeedService = new RawFeedService(models, io, logger);
	var rawFeedHistogram = new histogramDataModule(models.rawFeed);

	/**
	 * List all Raw Feed
	 */
	app.get("/rawfeed/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of Raw Feeds");
		}

		rawFeedService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Raw Feeds", err);
				responseHandler.send500(res, "Error listing Raw Feeds");
			} else {
				rawFeedService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("RawFeed: " + err, err);
						responseHandler.send500(res, "Error getting count of Raw Feeds");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});

	/**
	 * List all indexes for the Raw Feed object
	 */
	app.get("/rawfeed/indexes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the Raw Feed object");
		}

		rawFeedService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes for the Raw Feed object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});

	/**
	 * List all date attributes for the Raw Feed object
	 */
	app.get("/rawfeed/datetypes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of date attributes for the Raw Feed object");
		}

		rawFeedService.getDateTypes(function(datetypes) {
			if (!datetypes) {
				responseHandler.send500(res, "Error getting date attributes for the Raw Feed object");
			} else {
				res.jsonp(datetypes);
				res.end();
			}
		});
	});

	/**
	 * List createdDate for all of the Raw Feeds (in milliseconds)
	 */
	app.get("/rawfeed/dates/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of dates for all Raw Feeds");
		}

		rawFeedService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Raw Feeds");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});

	/**
	 * A mode and base date are passed in, the will return the dates that fall
	 * within that mode, given the basedate.
	 */
	app.post("/rawfeed/dates/?", function(req, res){
		if(logger.DO_LOG){
			logger.info("Request for list of dates for all Raw Feeds");
		}
		rawFeedHistogram.findDatesByFrequency(req.body, function(dates) {
			if (!dates){
				responseHandler.send500(res, "Error getting dates for Raw Feeds");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});

	/**
	 * Create a new Raw Feed
	 */
	app.post("/rawfeed/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Raw Feed", req.body);
		}

		rawFeedService.create(req.body, function(err, val, newFeed) {
			if (err) {
				logger.error("Error saving Raw Feed", err);
				responseHandler.send500(res, "Error saving Raw Feed " + err);
			} else if (!val.valid) {
				logger.info("Invalid Raw Feed " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Raw Feed " + JSON.stringify(val.errors));
			} else {
				logger.info("Raw Feed saved " + JSON.stringify(newFeed));
				res.jsonp({_id: newFeed._id});
				res.end();
			}
		});
	});

	/**
	 * Review a Raw Feed by specified id
	 * "/rawfeed/:{param_name}(contents to go in param_name)"
	 */
	app.get("/rawfeed/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Raw Feed " + req.params.id);
		}

		rawFeedService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Raw Feed", err);
				responseHandler.send500(res, "Error getting Raw Feed");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	/**
	 * Update Raw Feed with specified id
	 */
	app.post("/rawfeed/:id([0-9a-f]+)", function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Update Raw Feed " + req.params.id, req.body);
		}

		rawFeedService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Raw Feed", err);
				responseHandler.send500(res, "Error updating Raw Feed " + err);
			} else if (val && !val.valid) {
				logger.info("Invalid Raw Feed " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Raw Feed " + JSON.stringify(val.errors));
			} else {
				logger.info("Raw Feed updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});

	/**
	 * Delete Raw Feed with specified id
	 */
	app.del("/rawfeed/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting Raw Feed with id: " + req.params.id);
		}

		rawFeedService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});

	/**
	 * Delete all Raw Feeds
	 */
	app.del("/rawfeed/",function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all Raw Feeds");
		}

		rawFeedService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};