var locationService = require('../database/location.js');
var validationModel = require('../../models/location/model.js');
var bvalidator = require('../../models/location/bvalidator.js');
var revalidator = require('revalidator');

this.load = function(app, io, gcm, logger) {
	//list - lists full object
	app.get('/location/?', function(req,res){
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
		// is the JSON semantically valid for the location object?
		var locVal = revalidator.validate(req.body, validationModel.locationValidation);
		if (locVal.valid) {
			// does the location object comply with business validation logic?
			var bVal = bvalidator.validate(req.body, validationModel.businessValidation);
			if (bVal.valid) {
				locationService.createLocation(req.body, res);				
			}
			else {
				if(logger.DO_LOG){
					logger.error(bVal.errors);
				}
				res.status(500);
				res.json({error: bVal.errors}, req.body);
			}
		}
		else {
			if(logger.DO_LOG){
				logger.error(locVal.errors);
			}
			res.status(500);
			res.json({error: locVal.errors}, req.body);
		}
	});
	
	//review
	app.get('/location/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for location "+req.params.id);
		}
		locationService.getLocation(req.params.id, res);
	});

	// search
	app.search('/location/?', function(req,res){
		if (logger.DO_LOG){
			logger.info("Search for location "+JSON.stringify(req.body));
		}
		locationService.searchLocation(req.body, res);
	});
	
	//Update
	app.post('/location/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update location "+req.params.id);
		}
		var locVal = revalidator.validate(req.body, validationModel.locationValidation);
		if (locVal.valid) {
			locationService.updateLocation(req.params.id, req.body, res);
		}
		else {
			if(logger.DO_LOG){
				logger.info(locVal.errors);
			}
			res.status(500);
			res.json({error: locVal.errors});
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
