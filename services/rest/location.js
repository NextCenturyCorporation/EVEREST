/*global require*/
// Identify require as a global function/keyword for JSHint

var locationService = require('../database/location.js');
var locationModel = require('../../models/location/model.js');
var revalidator = require('revalidator');

this.load = function(app, io, gcm, logger) {
	//list - lists name and id
	app.get('/location/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for location list");
		}
		locationService.listLocations(res);
	});
	
	//Create
	app.post('/location/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new location");
		}

		var validation = revalidator.validate(req.body, locationValidation);
		if (validation.valid) {
			locationService.createLocation(req.body, res);
		}
		else {
			if(logger.DO_LOG){
				logger.info(validation.valid, validation.errors);
			}
			res.status(500);
			res.json({error: validation.errors});
		}
		
	});
	
	//review
	app.get('/location/:id([0-9a-f]+)', function(req,res){
		if(0 && logger.DO_LOG){
			logger.info("Request for locaiton "+req.params.id);
		}
		locationService.getLocation(req.params.id, res);
	});
	
	//Update
	app.post('/location/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update location "+req.params.id);
		}
		locationService.updateLocation(req.params.id, req.body, res);
	});
	
	//delete
	app.del('/location/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting location with id: " + req.params.id);
		}
		locationService.deleteLocation(req.params.id, req.body, res);
	});
};