/**
 * Events module
 * Handles routing for /events and /events/id
 */

var LOG = true;


var eventManager = require('./models/event.js');

this.load_mod = function(app, logger, io){
	//Set up the route for listing all events
	app.get('/events/?', function(req, res){
		if(LOG){
			logger.info('Request for list of events');
		}
		eventManager.listEvents(res);
	});
	
	//And the route for getting event groups
	app.get('/events/:id([0-9]+)', function(req, res){
		if(0 && LOG){
			logger.info('Request for event '+req.params.id);
		}
		eventManager.getEventGroup(req.params.id, res);
	});
	
	//And the route for getting individual events
	app.get('/events/:id([0-9a-f]+)', function(req, res){
		if(0 && LOG){
			logger.info('Request for event '+req.params.id);
		}
		eventManager.getEvent(req.params.id, res);
	});
	
	//Lets try to get and store new events
	app.post('/events/?', function(req, res){
		if(LOG){
			logger.info("Receiving new event");
			logger.info(req.body);
		}
		eventManager.createEvent(req.body, res, io);
	});
	
	//Now, lets enable deleting events
	app.del('/events/:id([0-9a-f]+)',function(req, res){
		if(LOG){
			logger.info("Request to delete event");
			logger.info(req.body);
		}
		eventManager.deleteEvent(req.params.id, res);
	});
	
	
	//Comments!!
	app.get('/events/:id([0-9a-f]+)/comments',function(req,res){
		if(LOG){
			logger.info("Request for comments of "+req.params.id);
		}
		eventManager.getComments(req.params.id, res, io);
	});
	
	app.post('/events/:id([0-9a-f]+)/comments', function(req,res){
		eventManager.addComment(req.params.id, req.body, res, io);
	});
	
	//Locations
	app.get('/events/location/:id([0-9a-f]+)', function(req,res){
		if(0 && LOG){
			logger.info("Request for locaiton "+req.params.id);
		}
		eventManager.getLocation(req.params.id, res);
	});
	
	//Get a list of all locations, which will just list their id and name
	app.get('/events/location/list', function(req,res){
		if(LOG){
			logger.info("Request for location list");
		}
		eventManager.listLocations(res);
	});
	
	//Create a new location
	app.post('/events/location/?', function(req,res){
		if(LOG){
			logger.info("Receiving new location");
		}
		eventManager.createLocation(req.body, res);
	});
	
	//Contacts
	app.get('/events/contact/:id([0-9a-f]+)', function(req,res){
		if(LOG){
			logger.info("Request for contact "+req.params.id);
		}
		eventManager.getContact(req.params.id, res);
	});
	
	//Get a list of all the contacts in the system
	app.get('/events/contact/list', function(req, res){
		if(LOG){
			logger.info("Request for contact list");
		}
		eventManager.listContacts(res);
	});
	
	//Create a new contact
	app.post('/events/contact/?', function(req, res){
		if(LOG){
			logger.info("Receiving new contact");
		}
		eventManager.createContact(req.body, res);
	});
	
	//Get all options for server
	app.get('/options',function(req,res){
		if(LOG){
			logger.info("Request for all options");
		}
		eventManager.getOptions(req, res, io);
	});
	
	
};