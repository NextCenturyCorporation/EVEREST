/**
 * File to run without a database, and store everything in memory
 */
var winston = require('winston');
var models = require('./models.js');
var general = require('./general.js');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
	              new (winston.transports.File)({filename: 'logs/general.log'})],
});

/*
 * Arrays to store data
 */
var contactList = [];
var locationList = [];
var eventList = [];


/**
 * Insert a location, contact, and event into memory
 */
//Initial contact
var newContact = new models.contact();
newContact.name = "George";
newContact.email = "george@com.com";
newContact.phone = "410-000-0000";
contactList.push(newContact);

logger.info("Contact:");
logger.info(newContact);

//Initial Location
var newLoc = new models.location();
newLoc.name = "Building A";
newLoc.radius = 50;
newLoc.latitude = 39.168051;
newLoc.longitude = -76.809801;
locationList.push(newLoc);

logger.info("Location:");
logger.info(newLoc);

//Initial Event
var newEvent = new models.event();
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

logger.info("Event:");
console.log(newEvent);

/**
 * Actual functions to return data
 */

/**
 * Returns a list of the last <count> events, where count = 10 or
 * was specified in the URL with ?count=#, up to 100
 */
this.listEvents = function(opts, res){
	var count = 10;
	//If someone requests a different number than the default size
	if(opts.count){
		count = opts.count;
		//Limit to 100
		if(count > 100){
			count = 100;
		}
	}
	var list = [];
	for(var i = 0; (i < eventList.length) && (i < count); i++){
		var tmp = {};
		tmp._id = eventList[i]._id;
		tmp.GID = eventList[i].GID;
		tmp.title = eventList[i].title;
		tmp.timestmp = eventList[i].timestmp;
		list.push(tmp);
	}
	res.json(list);
	res.end();
};

/**
 * Returns the series of events with the GID specified in the url:
 * /events/{GID}
 * Optionally, you can specify the number of comments to include with each event, up to 100
 */
this.getEventGroup = function(index, opts, res){
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
				if(contactList[j]._id.toString() == cur.contact.toString()){
					tmp['contact'] = contactList[j];
					break;
				}
			}
			//Embed the location
			for(var j=0; j < locationList.length; j++){
				if(contactList[j]._id.toString() == cur.contact.toString()){
					tmp['location'] = locationList[j];
					break;
				}
			}
			//Send comments if requested
			if(opts.comments){
				tmp.comments = cur.comments.slice(0, opts.comments);
			} else {
				tmp.comments = [];
			}
			tmp.numcomments = cur.numComments;
			group.splice(0,0,tmp);
		}
	}
	if(group.length > 0){
		group.sort(function(a,b){
			if(a.timestmp > b.timestmp){
				return -1;
			} else if(a.timestmp < b.timestmp){
				return 1;
			} else {
				return 0;
			}
		});
		res.json(group);
		res.end();
	} else {
		//Not found
		send404(res);
	}
};

/**
 * This returns the event with the ID specified in the URL. ID is a hexidecimal hash.
 * Optionally, cou can specify the number of comments to return with the event by adding
 * ?comments=# in the URL, up to 100. The default is not to include any.
 */
this.getEvent = function(index, opts, res){
	for(var i =0; i < eventList.length; i++){
		var cur = eventList[i];
		if(cur._id == index){
			var tmp = cur.toObject();
			//Embed the contact
			for(var j=0; j < contactList.length; j++){
				if(contactList[j]._id.toString() == cur.contact.toString()){
					tmp['contact'] = contactList[j];
					break;
				}
			}
			//Embed the location
			for(var j=0; j < locationList.length; j++){
				if(contactList[j]._id.toString() == cur.contact.toString()){
					tmp['location'] = locationList[j];
					break;
				}
			}
			//If comments were requested
			if(opts.comments){
				//Limit to 100
				if(opts.comments > 100){
					opts.comments = 100;
				}
				tmp.comments = cur.comments.slice(0,opts.comments);
			} else {
				tmp.comments = [];
			}
			tmp.numComments = cur.numComments;
			res.json(tmp);
			res.end();
			return;
		}
	}
	//Not found
	general.send404(res);
};

/**
 * This creates a new event based on the data POSTed.
 * For details on what to post, see the Event schema in models.js
 * All validation is handled through the schema.
 * Including a GID is optional.
 *
 * On success, it returns the id and GID of the new event, and emits
 * a Socket.io message with the ID and GID
 */
this.createEvent = function(req, res, io){
	var newEvent = new models.event(req);
	//Check if GID is set
	if(newEvent.GID == undefined || newEvent.GID == null){
		//Need to determine the GID
		var max = 0;
		for(var i =0; i < eventList.length; i++){
			if(eventList[i].GID > max){
				max = eventList[i].GID;
			}
		}
		newEvent.GID = max + 1;
	}
	logger.info("Event to be saved:",newEvent.toObject());
	//Insert at the beginning of the list
	eventList.splice(0,0,newEvent);
	res.json({'GID':newEvent.GID, 'id':newEvent._id});
	res.end();
	io.sockets.emit('event', {'GID':newEvent.GID, 'id':newEvent._id});
};

/**
 * This creates a new event based on the data POSTed, with the GID specified in the URL
 * For details on what to post, see the Event schema in models.js
 * All validation is handled through the schema.
 *
 * On success, it returns the id and GID of the new event, and emits
 * a Socket.io message with the ID and GID
 */
this.createGroupEvent = function(data, gid, res, io){
	var newEvent = new models.event(data);
	newEvent.GID = gid;
	logger.info('New event posted to GID '+newEvent.GID, newEvent.toObject());
	//Insert at the beginning of the list
	eventList.splice(0,0,newEvent);
	res.json({'GID':newEvent.GID, 'id':newEvent._id});
	res.end();
	io.sockets.emit('event', {'GID':newEvent.GID, 'id':newEvent._id});
};

/**
 * This deletes the event with the id sepecified in the URL
 */
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
	general.send404(res);
};

/**
 * This gets the comments for the event wit the ID specified in the URL.
 * By default it returns 10, but can be overridden with ?count=#, up to 100
 */
this.getComments = function(index, opts, res){
	var count = 10;
	if(opts.count){
		count = opts.count;
		//Limit to 100
		if(count > 100){
			count = 100;
		}
	}
	for(var i =0; (i < eventList.length) && (i < count); i++){
		var cur = eventList[i];
		if(cur._id == index){
			//Comments are sorted newest first
			res.json(cur.comments.slice(0,count));
			res.end();
			return;
		};
	};
	general.send404(res);
};

/**
 * Returns a general options message
 */
this.getOptions = function(res){
	general.getOptions(res);
};

/**
 * Adds a comment to the event with the id in the URL.
 * On success, it returns status:'Success', and it emits a
 * Socket.io message with the id of the event.
 */
this.addComment = function(id, req, res, io){
	for(var i =0; i < eventList.length; i++){
		var cur = eventList[i];
		if(cur._id == id){
			var newComment = new models.comment(req);
			cur.comments.push(newComment);
			cur.comments.sort(function(a,b){
				if(a.timestmp > b.timestmp){
					return -1;
				} else if(a.timestmp < b.timestmp){
					return 1;
				} else {
					return 0;
				}
			});
			res.json({status:'OK'});
			res.end();
			io.sockets.emit('comment', {'id':cur._id});
			return;
		};
	}
	general.send404(res);
};

/**
 * Returns the location with the id specified in the URL
 */
this.getLocation = function(id, res){
	for(var i =0; i < locationList.length; i++){
		var cur = locationList[i];
		if(cur._id == id){
			res.json(cur);
			res.end();
			return;
		};
	}
	//Not found
	general.send404(res);
};

/**
 * Returns a list of all the location ids and names
 */
this.listLocations = function(res){
	res.json(locationList);
	res.end();
};

/**
 * Creates a new location from the data POSTed
 * See the Location schema in models.js for details on the data to post.
 * All validation is handled though the schema.
 *
 * On success, it returns id:<ID-hash>
 */
this.createLocation = function(data, res){
	var newLoc = new models.location(data);
	locationList.push(newLoc);
	res.json({id:newLoc._id});
	res.end();
};

/**
 * This updates the location with id specified in the URL.
 * It will not change the id.
 * On success, it returns status:ok
 */
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
			res.json({status:'ok'});
			res.end();
			return;
		}
	}
	general.send404(res);
};

/**
 * Returns the contact object with id specified in the URL.
 */
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
	general.send404(res);
};

/**
 * Returns a list of all the contact names and ids
 */
this.listContacts = function(res){
	res.json(contactList);
	res.end();
};

/**
 * Creates a new contact object based on the data POSTed.
 * See the Contact schema for details on what to post.
 * All validation is handled through the schema.
 *
 * On success, it returns id:<ID-hash>
 */
this.createContact = function(data, res){
	var newContact = new models.contact(data);
	contactList.push(newContact);
	res.json({id:newContact._id});
	res.end();
};

/**
 * This updates the location with id specified in the URL.
 * It will not change the id.
 * On success, it returns status:ok
 */
this.updateContact = function(id, data, res){
	for(var i = 0; i < contactList.length; i++){
		var cur = contactList[i];
		if(cur._id == id){
			//Found the contact to update
			//Update original with the POSTed data
			for(e in data){
				//Make sure not to change _id
				if(e != '_id'){
				}
			}
			cur[e] = data[e];
			res.json({status:'ok'});
			res.end();
			return;
		}
	}
	//Not found
	general.send404(res);
};
