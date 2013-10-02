var targetAssertionService = require('../database/target_assertion.js');

module.exports = function(app, models, io, logger) {
	
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;
	
	//list - lists full object
	app.get('/target_assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_assertion list");
		}
		targetAssertionService.list({}, function(err, docs){
			if(err){
				logger.info("Error listing target_assertions "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else {
				res.json(docs);
			}
			res.end();
		});
	});
	
	//list - lists name and id
	app.get('/target_assertion/names/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_assertion name list");
		}
		targetAssertionService.listFields({}, '_id name', function(err, docs){
			if(err){
				logger.info("Error listing target_assertion id - name "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else {
				res.json(docs);
			}
			res.end();
		});
	});

	//Create
	app.post('/target_assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new target_assertion");
		}
		targetAssertionService.create(req.body, function(err, val, newObj) {
			if(err){
				logger.error('Error saving target_assertion', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid target_assertion ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors});
			} else {
				logger.info('TargetAssertion saved ' + JSON.stringify(newObj));
				res.json({id:newObj._id});
			}
			res.end();
		});
	});

	//review
	app.get('/target_assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target_assertion "+req.params.id);
		}
		targetAssertionService.getTargetAssertion(req.params.id, function(err, docs){
			if(err) {
				logger.error("Error getting target_assertion ",err);
				res.status(500);
				res.json({error: 'Error'});
			} else if(docs) {
				res.json(docs);
			} else {
				res.status(404);
				res.json({error: 'Not found'});
			}
			res.end();
		});
	});

	app.get('/target_assertion/:name', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for targetAssertionByName "+req.params.name);
		}
		targetAssertionService.getTargetAssertionByName(req.params.name, function(err, docs){
			if(err) {
				logger.info("Error getting targetAssertionByName "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else if(0 !== docs.length) {
				res.json(docs);
			} else {
				res.status(404);
				res.json({error: 'Not found'});
			}
			res.end();
		});
	});

	//Update
	app.post('/target_assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update target_assertion "+req.params.id);
		}

		var data = req.body;

		targetAssertionService.updateTargetAssertion(req.params.id, data, function(err, val, updLoc) {
			if(err){
				logger.error('Error updating target_assertion', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid target_assertion ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, data);
			} else {
				logger.info('TargetAssertion updated ' + JSON.stringify(updLoc));
				res.json({id:updLoc._id});
			}
			res.end();
		});
	});
	
	//delete by id
	app.del('/target_assertion/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting target_assertion with id: " + req.params.id);
		}
		targetAssertionService.del({_id: req.body.id}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	//delete all
	app.del('/target_assertion/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all target_assertions");
		}
		targetAssertionService.del({}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});

};

