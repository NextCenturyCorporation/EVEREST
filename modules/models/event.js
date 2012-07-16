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
var winston = require('winston');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
	              new (winston.transports.File)({filename: 'logs/general.log'})],
});

//Connect to the database
if(!config.noDB){
	mongoose.connect('mongodb://'+config.db_host+':'+config.db_port+'/'+config.db_collection);
	logger.info('Connected to MongoDB on '+config.db_host);
};

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
	type		:	{type: String, enum: config.eventTypes },
	group		:	Number,
	status		:	{type: String, enum: ['Ongoing', 'Closed']},
	userID		:	ObjectId,
	description	:	String,
	radius		:	Number,
	comments	:	{type: [CommentSchema]},
	location	:	{type: ObjectId, ref: 'Location'},
	contact		:	{type: ObjectId, ref: 'Contacts'}
});

//Virtual method to get the number of comments
EventSchema.virtual('numComments').get(function(){
	return this.comments.length;
});

var ReportSchema = new Schema({
	description	:	String,
	type		:	{type: String, enum: ['Emergency', 'Warning', 'Weather', 'Traffic'] },
	location	:	ObjectId,
	submitter	:	ObjectId,
	timestmp	:	{type: Date, default: Date.now},
	reviewer	:	ObjectId,
	status		:	{type: String, enum: ['Valid', 'Invalid']},
	reviewComment	:	String,
	reviewTimestmp	:	Date,
	event		:	ObjectId
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

/*
 * Cache/No DB mode arrays
 */
var contactList = [];
var locationList = [];
var eventList = [];


/**
 * Insert a location, contact, and event into the DB.
 * Uncomment and start the server ONCE, then re-comment.
 */
if(config.noDB){
	//Initial contact
	var newContact = new contact();
	newContact.name = "George";
	newContact.email = "george@com.com";
	newContact.phone = "410-000-0000";
	contactList.push(newContact);
	/*
	newContact.save(function(err){
		if(err) logger.info("Error: "+err);
	});
	*/
	
	logger.info("Contact:");
	logger.info(newContact);
	
	//Initial Location
	var newLoc = new location();
	newLoc.name = "Building A";
	newLoc.radius = 50;
	newLoc.latitude = 39.168051;
	newLoc.longitude = -76.809801;
	locationList.push(newLoc);
	/*
	newLoc.save(function(err){
		if(err) logger.info("Error: "+err);
	});
	*/
	
	logger.info("Location:");
	logger.info(newLoc);
	
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
	eventList.push(newEvent);
	/*
	newEvent.save(function(err){
		if(err) logger.info("Error: "+err);
	});
	*/
	
	logger.info("Event:");
	console.log(newEvent);
} else {
	logger.info('Loading cache');
	//Fill the cache arrays from the DB
	location.find({}, function(err, docs){
		if(err){
			logger.info('Error loading locations:');
			logger.info(err);
		} else {
			logger.info('Loaded locations');
			locationList = docs;
		}
	});
	
	contact.find({}, function(err, docs){
		if(err){
			logger.info('Error loading contacts:');
			logger.info(err);
		} else {
			logger.info('Loaded contacts');
			contactList = docs;
		}
	});
	
	//TODO: Load events into cache
	event.find({},[	'GID', 'timestmp', 'title', 'type', 'group', 'status',
	               	'userID','description', 'radius',
	               	'comments', 'location', 'contact']).limit(10).exec(function(err, docs){
		if(err){
			logger.error('Error loading events:');
			logger.error(err);
		} else {
			logger.info('Loaded events');
			eventList = docs;
		}
	});
}

//General 404 error
var send404 = function(res, err){
	if(err){
		logger.error("Error: ",err);
	}
	res.status(404);
	res.json({error: 'Not found'});
	res.end();
}

//General 500 error
var send500 = function(res){
	res.status(500);
	res.json({error:'Server error'});
	res.end();
}

this.listEvents = function(req, res){
	if(config.noDB){
		var list = [];
		for(var i = 0; i < eventList.length; i++){
			var tmp = {};
			tmp._id = eventList[i]._id;
			tmp.GID = eventList[i].GID;
			tmp.timestmp = eventList[i].timestmp;
			list.push(tmp);
		}
		res.json(list);
		res.end();
	} else {
		event.find({}, ['GID', 'timestmp']).limit(10).execFind(function(err, docs){
			if(err){
				logger.error("Error listing events",err);
				send500(res);
			} else {
				res.json(docs);
				res.end();
			}
		});
	};
};

this.getEventGroup = function(index, res){
	//While using a database, it is much easier and probably faster to just let the DB handle it
	if(!config.noDB){
		//event.find({GID:index}, null, {sort: {timestamp: -1}}).populate('contact').populate('location').exec(function(err, docs){
		event.find({GID:index}, null, {sort: {timestamp: -1}}).populate('contact').populate('location').exec(function(err, docs){
			if(err){
				logger.error("Error getting event group",err);
				send500(res);
			} else if(docs.length > 0){
				var arr = [];
				for(var i=0; i< docs.length; i++){
					var tmp = docs[i].toObject();
					//Hide comments
					tmp.comments = [];
					tmp.numComments = docs[i].numComments;
					arr.push(tmp);
				}
				res.json(arr);
				res.end();			
			} else {
				send404(res);
			}
		});
	} else {
		var group = [];
		for(var i =0; i < eventList.length; i++){
			var cur = eventList[i];
			if(cur.GID == index){
				var tmp = {};
				for(e in cur.toObject()){
					tmp[e] = cur[e];
				}
				//Embed the contact
				for(var j=0; j < contactList.length; j++){
					if(contactList[j]._id == cur.contact){
						tmp['contact'] = contactList[j];
						break;
					}
				}
				//Embed the location
				for(var j=0; j < locationList.length; j++){
					if(contactList[j]._id == cur.contact){
						tmp['location'] = locationList[j];
						break;
					}
				}
				//Dont send comments
				tmp.comments = [];
				tmp.numcomments = cur.numComments;
				group.splice(0,0,tmp);
			}
		}
		if(group.length > 0){
			res.json(group);
			res.end();
		} else {
			//Not found
			send404(res);
		}
	}
};

this.getEvent = function(index, res){
	//If DB is enabled, it may not be cached
	if(!config.noDB){
		event.findById(index).populate('location').populate('contact').exec(function(err, docs){
			if(err){
				logger.error('Error getting event',err);
				send500(res);
			} else if(docs){
				var tmp = docs.toObject();
				tmp.numComments = docs.numComments;
				tmp.comments = [];
				res.json(tmp);
				res.end();			
			} else {
				send404(res);
			}
		});
	} else {
		for(var i =0; i < eventList.length; i++){
			var cur = eventList[i];
			if(cur._id == index){
				logger.info('Cached event');
				var tmp = cur.toObject();
				//Embed the contact
				for(var j=0; j < contactList.length; j++){
					if(contactList[j]._id == cur.contact){
						tmp['contact'] = contactList[j];
						break;
					}
				}
				//Embed the location
				for(var j=0; j < locationList.length; j++){
					if(contactList[j]._id == cur.contact){
						tmp['location'] = locationList[j];
						break;
					}
				}
				//Dont send comments
				tmp.comments = [];
				tmp.numComments = cur.numComments;
				res.json(tmp);
				res.end();
				return;
			}
		}
		//If there is no DB, and its not in memory, oops!
		send404(res);
	};
};

this.createEvent = function(req, res, io){
	logger.info(req);
	var newEvent = new event(req);
	logger.info("Event to be saved:");
	logger.info(newEvent);
	//Insert at the beginning of the list
	eventList.splice(0,0,newEvent);
	if(!config.noDB){
		newEvent.save(function(err){
			if(err){
				logger.error("Error creating event", err);
				send500(res);
			} else {
				res.json({status:'success', id:newEvent._id});
				res.end();
				//Broadcast to clients?
				io.sockets.emit('event', {'GID':newEvent.GID, 'id':newEvent._id});
			}
		});
	} else {
		res.json({status:'ok'});
		res.end();
		io.sockets.emit('event', {'GID':newEvent.GID, 'id':newEvent._id});
	};
};


this.deleteEvent = function(id, res){
	for(var i = 0; i<eventList.length; i++){
		var cur = eventList[i];
		if(cur._id == id){
			eventList.splice(i,1);
			res.send({status:'OK'});
			res.end();
			return;
		};
	}
	if(!config.noDB){
		event.find({_id:id}, function(err, docs){
			if(err || docs.longth == 0){
				logger.error('Error deleting event', err);
				send500(res);
			} else {
				for(cur in docs)
					cur.remove();
				res.json({status:'OK'});
				res.end();
			};
		});
	} else {
		send404(res);
	}
};

this.getComments = function(index, res, io){
	for(var i =0; i < eventList.length; i++){
		var cur = eventList[i];
		if(cur._id == index){
			res.json(cur.comments);
			res.end();
			return;
		};
	};
	if(!config.noDB){
		event.find({_id:index}, ['comments'], {sort: {timestamp: -1}}, function(err, docs){
			if(err){
				logger.error('Error getting comments',err);
				send500(res);
			} else if(docs.length > 0){
				res.json(docs[0].comments);
				//io.sockets.emit('comment', {'GID':docs[0].GID});
				res.end();			
			} else {
				send404(res);
			};
		});
	} else {
		send404(res);
	};
};

this.getOptions = function(index, res, io){
	res.json({"Get Events": "/events" , "Get One Event":" events/Event_ID_# ",
		"Post new event":"events/new","delete event (DEL)":"events/event_id_#","Get comments":"events/event_id_#/comments",
		"post comments":"events/envent_id_#/comments",
		"get a location":"events/location/event_id_#","Get all locations":"events/location/list",
		"Get a contact":"events/contact/eventID_#","Get All Contacts":"events/contact/list","get options":"/options"});
	res.end();
};


this.addComment = function(id, req, res, io){
	for(var i =0; i < eventList.length; i++){
		var cur = eventList[i];
		if(cur._id == id){
			var newComment = new comment(req);
			cur.comments.push(newComment);
			res.json({status:'OK'});
			res.end();
			io.sockets.emit('comment', {'id':cur._id});
			if(!config.noDB){
				cur.save(function(err){
					logger.info("Error: "+err);
				});
			}
			return;
		};
	}
	if(!config.noDB){
		event.find({_id:id}, ['comments','GID'], {sort: {timestamp: 1}}, function(err,docs){
			if(err || docs.length == 0){
				logger.error('Error adding comment',err);
				send500(res);
			} else {
				var newComment = new comment(req);
				docs[0].comments.push(newComment);
				docs[0].save(function(err){
					if(err){
						send500(res,err);
					} else {
						res.json({status: 'OK'});
						res.end();
						io.sockets.emit('comment', {'id':docs[0]._id});
					}
				});
			};
		});
	} else {
		send404(res);
	};
};

this.getLocation = function(id, res){
	for(var i =0; i < locationList.length; i++){
		var cur = locationList[i];
		if(cur._id == id){
			res.json(cur);
			res.end();
			return;
		};
	}
	send404(res);
	/*
	location.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting location "+err);
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
	*/
};

this.listLocations = function(res){
	res.json(locationList);
	res.end();
	/*
	location.find({},['_id', 'name'], function(err, docs){
		if(err){
			logger.info("Error listing locations "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
	*/
};

this.createLocation = function(data, res){
	var newLoc = new location(data);
	locationList.push(newLoc);
	if(!config.noDB){
		newLoc.save(function(err){
			if(err){
				logger.error('Error saving location', err);
				send500(res);
			} else {
				res.json({status:'ok'});
				res.end();
			}
		});
	} else {
		res.json({status:'ok'});
		res.end();
	}
};

this.updateLocation = function(id, data, res){
	for(var i = 0; i < locationList.length; i++){
		var cur = locationList[i];
		if(cur._id == id){
			//Found the location to update
			//Update original with the POSTed data
			for(e in data){
				//Make sure not to change _id
				if(e != '_id'){
					cur[e] = data[e];
				}
			}
			if(!config.noDB){
				cur.save(function(err){
					if(err){
						logger.err('Error updating location',err);
						send500(res);
					} else {
						res.json({status:'ok'});
						res.end();
					}
				});
			} else {
				res.json({status:'ok'});
				res.end();
			}
			return;
		}
	}
};

this.getContact = function(id, res){
	for(var i =0; i < contactList.length; i++){
		cur = contactList[i];
		if(cur._id == id){
			res.json(cur);
			res.end();
			return;
		};
	}
	//Not found
	send404(res);
	/*
	contact.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting contact "+err);
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
	*/
};

this.listContacts = function(res){
	res.json(contactList);
	res.end();
	/*
	contact.find({},['_id', 'name'], function(err, docs){
		if(err){
			logger.info("Error listing contacts "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
	*/
};

this.createContact = function(data, res){
	var newContact = new contact(data);
	contactList.push(newContact);
	if(!config.noDB){
		newContact.save(function(err){
			if(err){
				logger.error('Error saving contact',err);
				send500(res);
			} else {
				res.json({status:'ok'});
				res.end();
			}
		});
	} else {
		res.json({status:'ok'});
		res.end();
	}
};

this.updateContact = function(id, data, res){
	for(var i = 0; i < contactList.length; i++){
		var cur = contactList[i];
		if(cur._id == id){
			//Found the contact to update
			//Update original with the POSTed data
			for(e in data){
				//Make sure not to change _id
				if(e != '_id'){
					cur[e] = data[e];
				}
			}
			if(!config.noDB){
				cur.save(function(err){
					if(err){
						logger.err('Error updating contact',err);
						send500(res);
					} else {
						res.json({status:'ok'});
						res.end();
					}
				});
			} else {
				res.json({status:'ok'});
				res.end();
			}
			return;
		}
	}
};
