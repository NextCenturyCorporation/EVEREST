/**
 * Model for an event
 * Reference: http://mongoosejs.com/
 */

/**
 * Set up database connection to use
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config');

//Connect to the database
mongoose.connect('mongodb://'+config.db_host+':'+config.db_port+'/'+config.db_collection);

//Shorter name for the connection
//var db = mongoose.connection;

/**
 * Define the models
 */
//For less typing

var ObjectId = Schema.ObjectId;

//Define basic first
var UserSchema = new Schema({
	name	: {
			first	: String,
			last	:	String
			},
	email	: { type: String, required: true, index: {unique: true, sparse: true}},
	
});

var CommentSchema = new Schema({
	eventID		:	ObjectId,
	userID		: 	ObjectId,
	text		:	String,
	timestmp	:	{type: Date, default: Date.now},
	latitude	:	{type: Number, select: false},
	longitude	: 	{type: Number, select: false}
});

var LocationSchema = new Schema({
	name		:	String,
	latitude	:	Number,
	longitude	:	Number,
	radius		:	Number
});

var ContactSchema = new Schema({
	name		:	String,
	email		:	String,
	phone		:	String
});

var EventSchema = new Schema({
	GID			:	Number,
	timestmp	:	{type: Date, default: Date.now},
	title		:	String,
	type		:	{type: String, enum: ['Emergency', 'Warning', 'Weather', 'Traffic'] },
	group		:	{type: Number, select: false},
	status		:	{type: String, enum: ['Ongoing', 'Closed']},
	userID		:	ObjectId,
	description	:	String,
	radius		:	Number,
	comments	:	{type: [CommentSchema], select: false},
	location	:	ObjectId,
	contact		:	ObjectId
});

/**
 * Set the models up
 */
var comment = mongoose.model('Comment', CommentSchema);
var location = mongoose.model('Location', LocationSchema);
var contact = mongoose.model('Contacts', ContactSchema);
var event = mongoose.model('Event', EventSchema);

/**
 * At this point, creating new data should be as easy as:
 * var newEvent = new event();
 * newEvent.title = 'Test'
 * newEvent.save(function(err) {});
 * 
 * Finding events is as easy as:
 * event.find({id:1}, function(err, docs){
 * 		//docs contains all Events with a matching id
 * });
 * More: http://mongoosejs.com/docs/finding-documents.html
 * 
 */

/**
 * Insert a location, contact, and event into the DB.
 * Uncomment and start the server ONCE, then re-comment.
 */
/*
//Initial contact
var newContact = new contact();
newContact.name = "George";
newContact.email = "george@com.com";
newContact.phone = "410-000-0000";
newContact.save(function(err){
	if(err) console.log("Error: "+err);
});

console.log("Contact:");
console.log(newContact);

//Initial Location
var newLoc = new location();
newLoc.name = "Building A";
newLoc.radius = 50;
newLoc.latitude = 39.168051;
newLoc.longitude = -76.809801;
newLoc.save(function(err){
	if(err) console.log("Error: "+err);
});

console.log("Location:");
console.log(newLoc);

//Initial Event
var newEvent = new event();
newEvent.GID = 0;
newEvent.title = "Edgardo!";
newEvent.type= 'Emergency';
newEvent.group = 0;
newEvent.status = 'Ongoing';
newEvent.description = 'Aah! Hes here!';
newEvent.radius = 10;
newEvent.location = newLoc._id;
newEvent.contact = newContact._id;
newEvent.save(function(err){
	if(err) console.log("Error: "+err);
})

console.log("Event:");
console.log(newEvent);
*/

this.listEvents = function(res){
	event.find({}, ['GID', 'timestmp'], function(err, docs){
		if(err){
			console.log("Error: "+err);
			res.status(500);
			res.send('Error');
			res.end();
		} else {
			res.json(docs);
			res.end();
		}
	});
};

this.getEventGroup = function(index, res){
	event.find({GID:index}, null, {sort: {timestamp: -1}}, function(err, docs){
		if(err){
			console.log("Error: "+err);
			res.status(500);
			res.send('Error');
			res.end();
		} else if(docs.length > 0){
			res.json(docs);
			res.end();			
		} else {
			res.status(404);
			res.json({error:'Not Found'});
			res.end();
		}
	});
};

this.getEvent = function(index, res){
	event.findById(index, function(err, docs){
		if(err){
			console.log("Error: "+err);
			res.status(500);
			res.send('Error');
			res.end();
		} else if(docs){
			res.json(docs);
			res.end();			
		} else {
			res.status(404);
			res.json({error:'Not Found'});
			res.end();
		}
	});
};

this.createEvent = function(req, res, io){
	console.log(req);
	var newEvent = new event(req);
	console.log("Event to be saved:");
	console.log(newEvent);
	newEvent.save(function(err){
		if(err){
			console.log("Error creating event: "+err);
			res.status(500);
			res.json({error: 'Error saving'});
			res.end();
		} else {
			res.json({status:'success', id:newEvent._id});
			res.end();
			//Broadcast to clients?
			io.sockets.emit('event', {'GID':newEvent.GID});
		}
	});
};


this.deleteEvent = function(id, res){
	event.find({_id:id}, function(err, docs){
		if(err || docs.longth == 0){
			console.log("Error or no event "+err);
			res.status(500);
			res.json({error: 'Error'});
			res.end();
		} else {
			for(cur in docs)
				cur.remove();
			res.json({status:'OK'});
			res.end();
		}
	});
};

this.getComments = function(index, res, io){
	event.find({GID:index}, ['comments'], {sort: {timestamp: -1}}, function(err, docs){
		if(err){
			console.log("Error: "+err);
			res.status(500);
			res.send('Error');
			res.end();
		} else if(docs.length > 0){
			res.json(docs[0].comments);
			//io.sockets.emit('comment', {'GID':docs[0].GID});
			res.end();			
		} else {
			res.status(404);
			res.json({error:'Not Found'});
			res.end();
		}
	});
};

this.getOptions = function(index, res, io){
	res.json({"Get Events": "/events" , "Get One Event":" events/Event_ID_# ",
		"Post new event":"events/new","delete event (DEL)":"events/event_id_#","Get comments":"events/event_id_#/comments",
		"post comments":"events/envent_id_#/comments",
		"get a location":"events/location/event_id_#","Get all locations":"events/location/list",
		"Get a contact":"events/contact/eventID_#","Get All Contacts":"events/contact/list","get options":"/options"});
	res.end();
};


this.addComment = function(eid, req, res, io){
	event.find({GID:eid}, ['comments','GID'], {sort: {timestamp: 1}}, function(err,docs){
		if(err || docs.length == 0){
			console.log("Error or no event: "+err);
			res.status(500);
			res.json({error: 'Error'});
			res.end();
		} else {
			var newComment = new comment(req);
			docs[0].comments.push(newComment);
			docs[0].save(function(err){
				if(err){
					res.status(500);
					res.json({error: 'Error'});
					res.end();
				} else {
					res.json({status: 'OK'});
					res.end();
					io.sockets.emit('comment', {'GID':docs[0].GID, 'id':docs[0]._id});
				}
			});
		};
	});
};

this.getLocation = function(id, res){
	location.findById(id, function(err, docs){
		if(err) {
			console.log("Error getting location "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(docs) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};

this.listLocations = function(res){
	location.find({},['_id', 'name'], function(err, docs){
		if(err){
			console.log("Error listing locations "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};

this.getContact = function(id, res){
	contact.findById(id, function(err, docs){
		if(err) {
			console.log("Error getting contact "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else if(docs) {
			res.json(docs);
		} else {
			res.status(404);
			res.json({error: 'Not found'});
		}
		res.end();
	});
};

this.listContacts = function(res){
	contact.find({},['_id', 'name'], function(err, docs){
		if(err){
			console.log("Error listing contacts "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
};
