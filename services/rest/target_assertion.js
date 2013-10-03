var target_assertion_service = require('../database/target_assertion.js');
var responseHandler = require('../general_response');

module.exports = function(app, models, io, logger) {
	
	var me = this;
	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;
	var targetAssertionService = new target_assertion_service(models, io, logger);
	
	//list - lists full object
	app.get('/target-assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target-assertion list");
		}
		targetAssertionService.list({}, function(err, docs){
			if(err){
				logger.info("Error listing target-assertions "+err);
				responseHandler.send500(res, "Error listing target-assertions "+err);
			} else {
				res.json(docs);
				res.end();
			}
		});
	});
	
	//list - lists name and id
	app.get('/target-assertion/names/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target-assertion name list");
		}
		targetAssertionService.listFields({}, '_id name', function(err, docs){
			if(err){
				logger.info("Error listing target-assertion id - name "+err);
				responseHandler.send500(res, "Error listing target-assertion id - name "+err);
			} else {
				res.json(docs);
				res.end();
			}
		});
	});

	//Create
	app.post('/target-assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new target-assertion");
		}
		targetAssertionService.create(req.body, function(err, val, newObj) {
			if(err){
				logger.error('Error saving target-assertion', err);
				responseHandler.send500(res, 'Error saving target-assertion'+err);
			} else if (!val.valid) {
				logger.info('Invalid target-assertion ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid target-assertion ' + JSON.stringify(val.errors));
			} else {
				logger.info('TargetAssertion saved ' + JSON.stringify(newObj));
				res.json({_id:newObj._id});
				res.end();
			}
		});
	});

	//review
	app.get('/target-assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for target-assertion "+req.params.id);
		}
		targetAssertionService.get(req.params.id, function(err, docs){
			if(err) {
				logger.error("Error getting target-assertion ",err);
				responseHandler.send500(res, "Error getting target-assertion "+err);
			} else if(docs) {
				res.json(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	app.get('/target-assertion/:name', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for targetAssertionByName "+req.params.name);
		}
		targetAssertionService.getTargetAssertionByName(req.params.name, function(err, docs){
			if(err) {
				logger.info("Error getting targetAssertionByName "+err);
				responseHandler.send500(res, "Error getting targetAssertionByName "+err);
			} else if(0 !== docs.length) {
				res.json(docs);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});

	//Update
	app.post('/target-assertion/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update target-assertion "+req.params.id);
		}
		targetAssertionService.update(req.params.id, req.body, function(err, val, updLoc) {
			if(err){
				logger.error('Error updating target-assertion', err);
				responseHandler.send500(res, 'Error updating target-assertion '+err);
			} else if (!val.valid) {
				logger.info('Invalid target-assertion ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid target-assertion ' + JSON.stringify(val.errors));
			} else {
				logger.info('TargetAssertion updated ' + JSON.stringify(updLoc));
				res.json({_id:updLoc._id});
				res.end();
			}
		});
	});
	
	//delete by id
	app.del('/target-assertion/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting target-assertion with id: " + req.params.id);
		}
		targetAssertionService.del({_id: req.body.id}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	//delete all
	app.del('/target-assertion/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all target-assertions");
		}
		targetAssertionService.del({}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});

};

