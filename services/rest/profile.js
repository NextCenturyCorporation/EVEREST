var profileService = require('../database/profile.js');

this.load = function(app, io, gcm, logger) {
	//list - lists full object
	app.get('/profile/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for profile list");
		}
		profileService.listProfiles(res);
	});
	
	//list - lists name and id
	app.get('/profile/names/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for profile name list");
		}
		profileService.listProfileNames(res);
	});

	//Create
	app.post('/profile/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new profile");
		}
		profileService.createProfile(req.body, res);				
	});

	//review
	app.get('/profile/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for profile "+req.params.id);
		}
		profileService.getProfile(req.params.id, res);
	});

	app.get('/profile/:name', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for profileByName "+req.params.name);
		}
		profileService.getProfileByName(req.params.name, res);
	});

	// search
	app.search('/profile/?', function(req,res){
		if (logger.DO_LOG){
			logger.info("Search for profile "+JSON.stringify(req.body));
		}
		profileService.searchProfile(req.body, res);
	});
	
	//Update
	app.post('/profile/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update profile "+req.params.id);
		}
		profileService.updateProfile(req.params.id, req.body, res);
	});
	
	//delete by id
	app.del('/profile/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting profile with id: " + req.params.id);
		}
		profileService.deleteProfile(req.params.id, req.body, res);
	});
	
	//delete all
	app.del('/profile/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all profiles");
		}
		profileService.deleteProfiles(res);
	});

};

