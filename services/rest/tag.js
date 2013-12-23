var TagService = require("../database/tag.js");
var responseHandler = require("../general_response");

module.exports = function(app, models, io, logger) {
	var tagService = new TagService(models, io, logger);

	/**
	 * List all Tags
	 */
	app.get("/tag/?", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Request for a list of all Tags");
		}

		tagService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Tags", err);
				responseHandler.send500(res, "Error listing Tags");
			} else {
				tagService.getTotalCount(config, function(err, count) {
					if (err){
						logger.error("Tag: " + err, err);
						responseHandler.send500(res, "Error getting count of Tags");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});

	/**
	 * Create a new Tag
	 */
	app.post("/tag/?", function(req,res){
		if (logger.DO_LOG) {
			logger.info("Receiving new Tag ", req.body);
		}
		
		tagService.create(req.body, function(err, val, newTag) {
			if (err) {
				logger.error("Error saving Tag", err);
				responseHandler.send500(res, "Error saving Tag " + err);
			} else if (!val.valid) {
				logger.info("Invalid Tag " + JSON.stringify(val.errors));
				responseHandler.send500(res, "Invalid Tag " + JSON.stringify(val.errors));
			} else {
				logger.info("Tag saved " + JSON.stringify(newTag));
				res.jsonp({_id: newTag._id});
				res.end();
			}
		});
	});
	
	/**
	 * Review a Tag specified by id
	 * /tag/:{param_name}(contents go in param_name)
	 */
	app.get("/tag/:id", function(req,res){
		if (logger.DO_LOG) {
			logger.info("Request for Tag " + req.params.id);
		}
		
		tagService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error("Error getting Tag", err);
				responseHandler.send500(res, "Error getting Tag");
			} else if (docs[0]) {
				res.jsonp(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update Tag with specified id
	 */
	app.post("/tag/:id", function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Tag " + req.params.id);
		}

		tagService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error("Error updating Tag", err);
				responseHandler.send500(res, "Error updating Tag " + err);
			} else if (val && !val.valid) {
				logger.info("Invalid Tag " + JSON.stringify(val.errors));
				responseHandler.send500(res, " Invalid Tag " + JSON.stringify(val.errors));
			} else {
				logger.info("Tag updated " + JSON.stringify(updated));
				res.jsonp({_id: updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete a single Tag with specified id
	 */
	app.del("/tag/:id", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Deleting Tag with id: " + req.params.id);
		}
		
		tagService.del({_id: req.params.id}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Tags
	 */
	app.del("/tag/", function(req, res){
		if (logger.DO_LOG) {
			logger.info("Deleting all Tags");
		}
		
		tagService.del({}, function(err, count) {
			res.jsonp({deleted_count: count});
			res.end();
		});
	});
};