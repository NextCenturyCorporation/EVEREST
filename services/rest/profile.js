var ProfileService = require("../database/profile.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var profileService = new ProfileService(models, io, logger);

	/**
	 * List all Profiles
	 */
	app.get("/profile/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Profiles");
		}

		profileService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Profiles", err);
				responseHandler.send500(res, "Error listing Profiles");
			} else {
				profileService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Profile: " + err, err);
						responseHandler.send500(res, "Error getting count of Profiles");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				})
			}
		});
	});

	/**
	 * List all indexes for the Profile object
	 */
	app.get("/profile/indexes/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of indexes for the Profile object");
		}

		profileService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, "Error getting indexes for the Profile object");
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});

	/**
	 * List createdDate for all of the Profiles (in milliseconds)
	 */
	app.get("/profile/dates/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for list of dates for all Profiles");
		}

		profileService.findDates(function(dates) {
			if (!dates) {
				responseHandler.send500(res, "Error getting dates for Profiles");
			} else {
				res.jsonp(dates);
				res.end();
			}
		})
	});

	/**
	 * Lists the _id and name for all Profiles
	 */
	app.get("/profile/names/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Profile name list");
		}
		
		var params = {};
		profileService.listFields(params, "_id name", function(err, docs) {
			if (err) {
				logger.error("Error listing Profile id - name", err);
				responseHandler.send500(res, "Error listing Profile id - name");
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});

	/**
	 * Create a new Profile
	 */
	app.post("/profile/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Profile");
		}
		
		profileService.saveProfile(req.body, function(err, val, newProfile) {
			if (err) {
				logger.error("Error saving Profile", err);
				responseHandler.send500(res, "Error saving Profile");
			} else if (!val.valid) {
				logger.info("Invalid Profile " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Profile " + JSON.stringify(val.errors));
			} else {
				logger.info("Profile saved " + JSON.stringify(newProfile));
				res.jsonp({_id: newProfile._id});
				res.end();
			}
		});			
	});

	/**
	 * Review a Profile specified by id
	 * /profile/:{param_name}(contents go in param_name)
	 */
	app.get("/profile/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Profile " + req.params.id);
		}

		profileService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Profile", err);
				responseHandler.send500(res, "Error getting Profile");
			} else if(docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	/**
	 * Review a Profile with specified name
	 * /profile/:{param_name}(contents go in param_name)
	 */
	app.get("/profile/:name", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for Profile with name " + req.params.name);
		}
		
		profileService.findWhere({name: req.params.name}, function(err, docs) {
			if (err) {
				logger.error("Error listing Place with name " + req.params.name, err);
				responseHandler.send500(res, "Error getting Place by name");
			} else if (docs) {
				res.jsonp(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update Profile with specified id
	 */
	app.post("/profile/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Profile " + req.params.id);
		}
		
		profileService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Profile", err);
				responseHandler.send500(res, "Error updating Profile");
			} else if (val && !val.valid) {
				logger.info("Invalid Profile " + JSON.stringify(valid.errors));
				responseHandler.send500(res, "Invalid Profile " + JSON.stringify(valid.errors))
			} else {
				logger.info("Profile updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete a single Profile with specified id
	 */
	app.del("/profile/:id([0-9a-f]+)", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting Profile with id: " + req.params.id);
		}
		
		profileService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Profiles
	 */
	app.del("/profile/", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Deleting all Profiles");
		}
		
		profileService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};