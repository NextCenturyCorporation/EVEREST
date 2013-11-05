var placeService = require('../database/place.js');

var place = module.exports = function(app, models, io, logger) {
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;

	//list - lists full object
	app.get('/place/?', function(req, res){
		if(logger.DO_LOG){
			logger.info("Request for place list");
		}
		placeService.listPlaces(req, res);
	});
	
	//list - lists name and id
	app.get('/place/names/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for place name list");
		}
		placeService.listPlaceNames(res);
	});

	//Create
	app.post('/place/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new place");
		}
		placeService.createPlace(req.body, res);				
	});

	//review
	app.get('/place/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for place "+req.params.id);
		}
		placeService.getPlace(req.params.id, res);
	});

	app.get('/place/:name', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for placeByName "+req.params.name);
		}
		placeService.getPlaceByName(req.params.name, res);
	});
	
	//Update
	app.post('/place/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update place "+req.params.id);
		}
		placeService.updatePlace(req.params.id, req.body, res);
	});
	
	//delete by id
	app.del('/place/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting place with id: " + req.params.id);
		}
		placeService.deletePlace(req.params.id, req.body, res);
	});
	
	//delete all
	app.del('/place/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all places");
		}
		placeService.deletePlaces(res);
	});

};