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
};