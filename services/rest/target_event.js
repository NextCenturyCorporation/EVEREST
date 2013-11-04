var TargetEventService = require('../database/target_event.js');
var responseHandler = require('../general_response');

module.exports = function(app, models, io, logger) {
	
	var targetEventService = new TargetEventService(models, io, logger);

	//list - lists full object
	app.get('/target-event/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target-event list");
		}
		targetEventService.list({}, function(err, docs){
			if(err){
				logger.info("Error listing target-events "+err);
				responseHandler.send500(res, "Error listing target-events "+err);
			} else {
				res.jsonp(docs);
				res.end();
			}	
		});
	});
	
	//list - lists name and id
	app.get('/target-event/names/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target-event name list");
		}
		targetEventService.listFields(req.query, "_id name", function(err, docs){
			if(err){
				logger.info("Error listing target-event id - name "+err);
				responseHandler.send500(res, "Error listing target-event id - name "+err);
			} else {
				res.jsonp(docs);
				res.end();
			}
		});
	});

	//Create a target event.
	app.post('/target-event/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new target-event");
		}
		targetEventService.create(req.body, function(err, val, newObj) {
			if(err){
				logger.error('Error saving target-event', err);
				responseHandler.send500(res, 'Error saving target-event');
			} else if (!val.valid) {
				logger.info('Invalid target-event ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid target event');
			} else {
				logger.info('TargetEvent saved ' + JSON.stringify(newObj));
				res.json({_id:newObj._id});
				res.end();
			}
			
		});
	});

	//Gets a target Event by its given id.
	app.get('/target-event/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target-event "+req.params.id);
		}
		targetEventService.get(req.params.id, function(err, docs){
			if(err) {
				logger.info("Error getting target-event "+err);
				responseHandler.send500(res, "Error getting target-event "+err);
			} else if(docs) {
				res.jsonp(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
			
		});
	});
	
	//Updates the given taget event.
	app.post('/target-event/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update target-event "+req.params.id);
		}
		targetEventService.update(req.params.id, req.body, function(err, val, updLoc) {
			if(err){
				logger.error('Error updating target-event', err);
				responseHandler.send500(res, 'Error updating target-event', err);
			} else if (!val.valid) {
				logger.info('Invalid target-event ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid target-event ' + JSON.stringify(val.errors));
			} else {
				logger.info('TargetEvent updated ' + JSON.stringify(updLoc));
				res.json({_id:updLoc._id});
				res.end();
			}
		});
	});
	
	//Deletes the given target evenet by id
	app.del('/target-event/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting target-event with id: " + req.params.id);
		}
		targetEventService.del({_id: req.params.id}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	//Deletes all target events.
	app.del('/target-event/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all target-event");
		}
		targetEventService.del({}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});

};

