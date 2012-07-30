/**
 * Handles the routing
 */
var winston = require('winston');
var config = require('../config.js');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
	              new (winston.transports.File)({filename: 'logs/general.log'})],
});

var LOG = true;

var eventManager = null;

//Determine how to manage the events
if(config.noDB){
	//Use the local version
	eventManager = require('./local.js');
} else {
	//Connect to the database
	eventManager = require('./connected.js');
}

this.load = function(app, io){
	//Set up the route for listing all events
	app.get('/events/?', function(req, res){
		if(LOG){
			logger.info('Request for list of events');
		}
		eventManager.listEvents(req.query, res);
	});
	
	//Get the index too
	app.get('/', function(req, res){
		if(LOG){
			logger.info('Request for list of events');
		}
		eventManager.listEvents(req.query, res);
	});
	
	//And the route for getting event groups
	app.get('/events/:id([0-9]+)', function(req, res){
		eventManager.getEventGroup(req.params.id, req.query, res);
	});
	
	//And the route for getting individual events
	app.get('/events/:id([0-9a-f]+)', function(req, res){
		eventManager.getEvent(req.params.id, req.query, res);
	});
	
	//Create a new event
	app.post('/events/?', function(req, res){
		if(LOG){
			logger.info("Receiving new event", req.body);
		}
		eventManager.createEvent(req.body, res, io);
	});
	
	//Add an event to a current group
	app.post('/events/:id([0-9]+)', function(req,res){
		if(LOG){
			logger.info("New event for group "+req.params.id, req.body);
		}
		eventManager.createGroupEvent(req.body, req.params.id, res, io);
	});
	
	//Now, lets enable deleting events
	app.del('/events/:id([0-9a-f]+)',function(req, res){
		if(LOG){
			logger.info("Request to delete event");
		}
		eventManager.deleteEvent(req.params.id, res);
	});
	
	
	//Comments!!
	app.get('/events/:id([0-9a-f]+)/comments',function(req,res){
		if(LOG){
			logger.info("Request for comments of "+req.params.id);
		}
		eventManager.getComments(req.params.id, req, res);
	});
	
	//Add a comment
	app.post('/events/:id([0-9a-f]+)/comments', function(req,res){
		eventManager.addComment(req.params.id, req.body, res, io);
	});
	
	//Locations
	app.get('/location/:id([0-9a-f]+)', function(req,res){
		if(0 && LOG){
			logger.info("Request for locaiton "+req.params.id);
		}
		eventManager.getLocation(req.params.id, res);
	});
	
	//Get a list of all locations, which will just list their id and name
	app.get('/location/', function(req,res){
		if(LOG){
			logger.info("Request for location list");
		}
		eventManager.listLocations(res);
	});
	
	//Create a new location
	app.post('/location/?', function(req,res){
		if(LOG){
			logger.info("Receiving new location");
		}
		eventManager.createLocation(req.body, res);
	});
	
	//Update a location
	app.post('/location/:id([0-9a-f]+)', function(req,res){
		if(LOG){
			logger.info("Update location "+req.params.id);
		}
		eventManager.updateLocation(req.params.id, req.body, res);
	});
	
	//Contacts
	app.get('/contact/:id([0-9a-f]+)', function(req,res){
		if(LOG){
			logger.info("Request for contact "+req.params.id);
		}
		eventManager.getContact(req.params.id, res);
	});
	
	//Get a list of all the contacts in the system
	app.get('/contact/', function(req, res){
		if(LOG){
			logger.info("Request for contact list");
		}
		eventManager.listContacts(res);
	});
	
	//Create a new contact
	app.post('/contact/?', function(req, res){
		if(LOG){
			logger.info("Receiving new contact",req.body);
		}
		eventManager.createContact(req.body, res);
	});
	
	//Update a contact
	app.post('/contact/:id([0-9a-f]+)', function(req,res){
		if(LOG){
			logger.info("Update contact "+req.params.id);
		}
		eventManager.updateContact(req.params.id, req.body, res);
	});
	
	//Get all options for server
	app.get('/options',function(req,res){
		if(LOG){
			logger.info("Request for all options");
		}
		eventManager.getOptions(res);
	});
	
	
};