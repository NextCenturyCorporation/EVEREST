/**
 * General functions
 */

//General 404 error
this.send404 = function(res){
	res.status(404);
	res.json({error: 'Not found'});
	res.end();
};

//General 500 error
this.send500 = function(res){
	res.status(500);
	res.json({error:'Server error'});
	res.end();
};

this.getOptions = function(res){
	res.json({"Get Events": "/events" , "Get One Event":" events/Event_ID_# ",
		"Post new event":"events/new","delete event (DEL)":"events/event_id_#","Get comments":"events/event_id_#/comments",
		"post comments":"events/envent_id_#/comments",
		"get a location":"events/location/event_id_#","Get all locations":"events/location/list",
		"Get a contact":"events/contact/eventID_#","Get All Contacts":"events/contact/list","get options":"/options"});
	res.end();
};