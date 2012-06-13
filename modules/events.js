/**
 * Events module
 * Handles routing for /events and /events/id
 */

var LOG = true;


var eventManager = require('./models/event.js');

this.load_mod = function(app){
	//Set up the route for listing all events
	app.get('/events/?', function(req, res){
		if(LOG){
			console.log('Request for list of events');
		}
		eventManager.listEvents(res);
	});
	
	//And the route for getting individual events
	app.get('/events/:id([0-9]+)', function(req, res){
		if(LOG){
			console.log('Request for event '+req.params.id);
		}
		eventManager.getEvent(req.params.id, res);
	});
	
	//Lets try to get and store new events
	app.post('/events/new', function(req, res){
		if(LOG){
			console.log("Receiving new event");
			console.log(req.body);
		}
		eventManager.createEvent(req.body.title, req.body.description, req.body.location);
		res.redirect('/events');
	});
	
	//Now, lets enable deleting events
	app.del('/events/:id([0-9]+)',function(req, res){
		if(LOG){
			console.log("Request to delete event");
			console.log(req.body);
		}
		eventManager.deleteEvent(req.params.id);
		res.send("OK");
		res.end();
	});
	
	
	//Comments!!
	app.get('/events/:id([0-9]+)/comments',function(req,res){
		if(LOG){
			console.log("Request for commetns of "+req.params.id);
		}
		eventManager.getComments(req.params.id, res);
	});
	
	app.post('/events/:id([0-9]+)/comments', function(req,res){
		eventManager.addComment(req.params.id, req.body.lat, req.body.long, req.body.text, req.body.uID);
		res.send("OK");
		res.end();
	});
	
	//Locations
	app.get('/events/location/:id([0-9a-f]+)', function(req,res){
		if(LOG){
			console.log("Request for locaiton "+req.params.id);
		}
		eventManager.getLocation(req.params.id, res);
	});
	
	//Get a list of all locations, which will just list their id and name
	app.get('/events/location/list', function(req,res){
		if(LOG){
			console.log("Request for location list");
		}
		eventManager.listLocations(res);
	});
	
	//Contacts
	app.get('/events/contact/:id([0-9a-f]+)', function(req,res){
		if(LOG){
			console.log("Request for contact "+req.params.id);
		}
		eventManager.getContact(req.params.id, res);
	});
	
	//Get a list of all the contacts in the system
	app.get('/events/contact/list', function(req, res){
		if(LOG){
			console.log("Request for contact list");
		}
		eventManager.listContacts(res);
	});
};