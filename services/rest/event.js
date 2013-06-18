var eventService = require('../database/event.js');

//FIXME need io and gcm

this.load = function(app, io, gcm, logger) {
	//Set up the route for listing all events
	app.get('/events/?', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for list of events');
		}
		eventService.listEvents(req.query, res);
	});
	
	//Create a new event
	app.post('/events/?', function(req, res){
		if(logger.DO_LOG){
			logger.info("Receiving new event", req.body);
		}
		eventService.createEvent(req.body, res, io, gcm);
	});
	
	//And the route for getting individual events
	app.get('/events/:id([0-9a-f]+)', function(req, res){
		eventService.getEvent(req.params.id, req.query, res);
	});
	
	//Now, lets enable deleting events
	app.del('/events/:id([0-9a-f]+)',function(req, res){
		if(logger.DO_LOG){
			logger.info("Request to delete event");
		}
		eventService.deleteEvent(req.params.id, res);
	});
	
	//Add an event to a current group //FIXME does it make sense to take a event for a group based on url with id or to update the event
	app.post('/events/:id([0-9]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("New event for group "+req.params.id, req.body);
		}
		eventService.createGroupEvent(req.body, req.params.id, res, io, gcm);
	});
	
	//And the route for getting event groups
	app.get('/events/:id([0-9]+)', function(req, res){
		eventService.getEventGroup(req.params.id, req.query, res);
	});
}