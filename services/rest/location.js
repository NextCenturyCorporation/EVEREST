var locationService = require('../database/location.js');

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
		locationService.createLocation(req.body, res);
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