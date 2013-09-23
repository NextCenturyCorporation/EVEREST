var TargetEventService = require('../database/target_event.js');

module.exports = function(app, models, io, logger) {
	
	var targetEventService = new TargetEventService(models, io, logger);

	//list - lists full object
	app.get('/target_event/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_event list");
		}

		targetEventService.list({}, function(err, docs){
			if(err){
				logger.info("Error listing target_events "+err);
				res.status(500);
				res.jsonp({error: 'Error'});
			} else {
				res.jsonp(docs);
			}
			res.end();
		});
	});
	
	//list - lists name and id
	app.get('/target_event/names/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_event name list");
		}

		targetEventService.listFields(req.query, "_id name", function(err, docs){
			if(err){
				logger.info("Error listing target_event id - name "+err);
				res.status(500);
				res.jsonp({error: 'Error'});
			} else {
				res.jsonp(docs);
			}
			res.end();
		});
	});

	//Create
	app.post('/target_event/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new target_event");
		}
		targetEventService.save(req.body, function(err, val, newObj) {
			if(err){
				logger.error('Error saving target_event', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid target_event ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors});
			} else {
				logger.info('TargetEvent saved ' + JSON.stringify(newObj));
				res.json({id:newObj._id});
			}
			res.end();
		});
	});

	//review
	app.get('/target_event/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_event "+req.params.id);
		}
		targetEventService.get(req.params.id, function(err, docs){
			if(err) {
				logger.info("Error getting target_event "+err);
				res.status(500);
				res.jsonp({error: 'Error'});
			} else if(docs) {
				res.jsonp(docs);
			} else {
				res.status(404);
				res.jsonp({error: 'Not found'});
			}
			res.end();
		});
	});

	// search
	//express does not support a search request type; is that a valid http request type
	/*app.search('/target_event/?', function(req,res){
		if (logger.DO_LOG){
			logger.info("Search for target_event "+JSON.stringify(req.body));
		}
		targetEventService.findWhere(req.body, function(err, docs){
			if(err) {
				logger.info("Error getting target_event "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else if(docs.length !== 0) {
				res.json(docs);
			} else {
				res.status(404);
				res.json({error: 'Not found'});
			}
			res.end();
		});
	});*/
	
	//Update
	app.post('/target_event/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update target_event "+req.params.id);
		}
		targetEventService.update(req.params.id, req.body, function(err, val, updLoc) {
			if(err){
				logger.error('Error updating target_event', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid target_event ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, req.body);
			} else {
				logger.info('TargetEvent updated ' + JSON.stringify(updLoc));
				res.json({id:updLoc._id});
			}
			res.end();
		});
	});
	
	//delete by id
	app.del('/target_event/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting target_event with id: " + req.params.id);
		}
		targetEventService.del({_id: req.params.id}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	//delete all
	app.del('/target_event/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all target_event");
		}
		targetEventService.del({}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});

};

