/**
 * Model for an event
 * Reference: http://mongoosejs.com/
 */

/**
 * Set up database connection to use
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Connect to the database
mongoose.connect('mongodb://10.10.16.40/centurion');

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
 * var newEvent = new Event();
 * newEvent.title = 'Test'
 * newEvent.save(function(err) {});
 * 
 * Finding events is as easy as:
 * Event.find({id:1}, function(err, docs){
 * 		//docs contains all Events with a matching id
 * });
 * More: http://mongoosejs.com/docs/finding-documents.html
 * 
 */

/**
 * Insert a location, contact, and event into the DB
 */
/*
 * NOTE: Stored in DB now, with _id  4fd8c807b55dece408000002
var newContact = new contact();
newContact.name = "George";
newContact.email = "george@com.com";
newContact.phone = "410-000-0000";
newContact.save(function(err){
	if(err) console.log("Error: "+err);
});

console.log("Contact:");
console.log(newContact);
*/

/*
 * NOTE: Stored in DB now, with _id 4fd8c807b55dece408000003
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
*/

/*
 * In DB as event with GID 0
var newEvent = new event();
newEvent.GID = 0;
newEvent.title = "Edguardo!";
newEvent.type= 'Emergency';
newEvent.group = 0;
newEvent.status = 'Ongoing';
newEvent.description = 'Aah! Hes here!';
newEvent.radius = 10;
newEvent.save(function(err){
	if(err) console.log("Error: "+err);
})
*/

this.listEvents = function(res){
	event.find({}, ['GID'], function(err, docs){
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

this.getEvent = function(index, res){
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

this.createEvent = function(title, message, location, res){
	res.send('Todo');
	res.end();
};


this.deleteEvent = function(id, res){
	res.json({todo: 'Todo'});
};

this.getComments = function(index, res){
	event.find({GID:index}, ['comments'], {sort: {timestamp: -1}}, function(err, docs){
		if(err){
			console.log("Error: "+err);
			res.status(500);
			res.send('Error');
			res.end();
		} else if(docs.length > 0){
			res.json(docs[0].comments);
			res.end();			
		} else {
			res.status(404);
			res.json({error:'Not Found'});
			res.end();
		}
	});
};

this.addComment = function(eID, lat, long, text, uID, res){
	res.json({todo: 'Todo'});
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
