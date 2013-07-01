var locationService = require('../database/location.js');
var locationValidation = require('../../models/location/model.js');
var revalidator = require('revalidator');

this.load = function(app, io, gcm, logger) {
	//list - lists full object
	app.get('/location/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for location list");
		}
		locationService.listLocations(res);
	});
	
	//list - lists name and id
	app.get('/location/names/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for location name list");
		}
		locationService.listLocationNames(res);
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
				logger.info(validation.errors);
			}
			res.status(500);
			res.json({error: validation.errors}, req.body);
		}
	});
	
	//review
	app.get('/location/:id([0-9a-f]+)', function(req,res){
		if(0 && logger.DO_LOG){
			logger.info("Request for location "+req.params.id);
		}
		locationService.getLocation(req.params.id, res);
	});
	
	//Update
	app.post('/location/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update location "+req.params.id);
		}
		var validation = revalidator.validate(req.body, locationValidation);
		if (validation.valid) {
			locationService.updateLocation(req.params.id, req.body, res);
		}
		else {
			if(logger.DO_LOG){
				logger.info(validation.errors);
			}
			res.status(500);
			res.json({error: validation.errors});
		}
	});
	
	//delete by id
	app.del('/location/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting location with id: " + req.params.id);
		}
		locationService.deleteLocation(req.params.id, req.body, res);
	});
	
	//delete all
	app.del('/location/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all locations");
		}
		locationService.deleteLocations(res);
	});

};
