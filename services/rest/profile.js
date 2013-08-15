var ProfileService = require('../database/profile.js');

var profile = module.exports = function(app, models, io, logger) {
	var me = this;

	me.profileService = new ProfileService(models, io, logger);

	//list - lists full object
	app.get('/profile/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for profile list");
		}

		me.profileService.list({}, function(err, profiles) {
			if(err){
				logger.info("Error listing profiles "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else {
				res.json(profiles);
			}
			res.end();
		});
	});
	
	//list - lists name and id
	app.get('/profile/names/', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for profile name list");
		}
		
		me.profileService.listFields({}, '_id name', function(err, docs){
			if(err){
				logger.info("Error listing profile id - name "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else {
				res.json(docs);
			}
			res.end();
		});
	});

	//Create
	app.post('/profile/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Receiving new profile");
		}
		
		me.profileService.saveProfile(req.body, function(err, val, newLoc) {
			if(err){
				logger.error('Error saving profile', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!val.valid) {
				logger.info('Invalid profile ' + JSON.stringify(val.errors));
				res.status(500);
				res.json({error: val.errors}, req.body);
			} else {
				logger.info('Profile saved ' + JSON.stringify(newLoc));
				res.json({id:newLoc._id});
			}
			res.end();
		});			
	});

	//get
	app.get('/profile/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for profile "+req.params.id);
		}
		me.profileService.get(req.params.id, function(err, foundProfile) {
			if(err) {
				logger.info("Error getting profile "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else if(foundProfile) {
				res.json(foundProfile);
			} else {
				res.status(404);
				res.json({error: 'Not found'});
			}
			res.end();
		});
	});

	app.get('/profile/:name', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for profileByName "+req.params.name);
		}
		
		me.findWhere({name: req.params.name}, function(err, found) {
			if(err) {
				logger.info("Error getting profileByName "+err);
				res.status(500);
				res.json({error: 'Error'});
			} else if(0 !== found.length) {
				res.json(found);
			} else {
				res.status(404);
				res.json({error: 'Not found'});
			}
			res.end();
		});
	});

	/*// search
	app.search('/profile/?', function(req,res){
		if (logger.DO_LOG){
			logger.info("Search for profile "+JSON.stringify(req.body));
		}
		profileService.searchProfile(req.body, res);
	});*/
	
	//Update
	app.post('/profile/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update profile "+req.params.id);
		}
		
		me.profileService.update(req.params.id, req.body, function(err, valid, updatedProfile) {
			if(err){
				logger.error('Error updating profile', err);
				res.status(500);
				res.json({error: 'Error'});
			} else if (!valid.valid) {
				logger.info('Invalid profile ' + JSON.stringify(valid.errors));
				res.status(500);
				res.json({error: valid.errors}, req.body);
			} else {
				logger.info('Profile updated ' + JSON.stringify(updatedProfile));
				res.json({id:updatedProfile._id});
			}
			res.end();
		});
	});
	
	//delete by id
	app.del('/profile/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting profile with id: " + req.params.id);
		}
		
		me.profileService.del({_id: req.params.id}, function(err) {
			if(err){
				logger.error('Error deleting profile ' + req.params.id, err);
				res.status('500');
				res.json({error:'Error deleting profile ' + req.params.id});
				res.end();
			}
			
			res.json({status:'ok'});
			res.end();
		});
	});
	
	//delete all
	app.del('/profile/', function(req, res) {
		if(logger.DO_LOG) {
			logger.info("Deleting all profiles");
		}
		
		me.profileService.del({}, function(err) {
			if(err){
				logger.error('Error deleting profiles', err);
				res.status('500');
				res.json({error:'Error deleting profiles'});
				res.end();
			}
			
			res.json({status:'ok'});
			res.end();
		});
	});
};

