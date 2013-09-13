var locationService = require('../database/location.js');

var location = module.exports = function(app, models, io, logger) {
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;

	//list - lists full object
	app.get('/location/?', function(req, res){
		if(logger.DO_LOG){
			logger.info("Request for location list");
		}
		locationService.listLocations(req, res);
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
		locationService.createLocation(req.body, res);				
	});

	//review
	app.get('/location/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for location "+req.params.id);
		}
		locationService.getLocation(req.params.id, res);
	});

	app.get('/location/:name', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for locationByName "+req.params.name);
		}
		locationService.getLocationByName(req.params.name, res);
	});

	// search
	//FIXME express does not support a search request.
	/*app.search('/location/?', function(req,res){
		if (logger.DO_LOG){
			logger.info("Search for location "+JSON.stringify(req.body));
		}
		locationService.searchLocation(req.body, res);
	});*/
	
	//Update
	app.post('/location/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update location "+req.params.id);
		}
		locationService.updateLocation(req.params.id, req.body, res);
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

