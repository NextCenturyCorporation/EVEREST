/**
 * General functions
 */
var general = {};

//General 404 error
general.send404 = function(res){
	res.status(404);
	res.jsonp({error: 'Not found'});
	res.end();
};

//General 500 error
general.send500 = function(res, msg){
	res.status(500);
	res.jsonp({error:'Server error ' + msg});
	res.end();
};

general.getOptions = function(res){
	res.json({"Get Events": "/events" , "Get One Event":" events/Event_ID_# ",
		"Post new event":"events/new","delete event (DEL)":"events/event_id_#","Get comments":"events/event_id_#/comments",
		"post comments":"events/envent_id_#/comments",
		"get a location":"events/location/event_id_#","Get all locations":"events/location/list",
		"Get a contact":"events/contact/eventID_#","Get All Contacts":"events/contact/list","get options":"/options"});
	res.end();
};

module.exports = general;