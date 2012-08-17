/**
 * Runs while connected to a database
 */
var config = require('../config');
var winston = require('winston');
var general = require('./general');
var models = require('./models');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
	              new (winston.transports.File)({filename: 'logs/general.log'})],
});

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
	if(opts.after){
		// Finding events after a provided ID while using mongo is a little more complicated
		// Query to find the date of said event, then query for all where the date is > the first date
		models.event.findById(opts.after, 'timestmp', function(err1, doc){
			if(err1){
				logger.error("Error finding event", err1);
				general.send500(res);
				return;
			}
			models.event.find({timestmp: {$gt: doc.timestmp}}, 'GID title timestmp', {sort: {timestmp: -1}}).
					limit(count).execFind(function(err, docs){
				if(err){
					logger.error("Error listing events",err);
					send500(res);
				} else {
					res.json(docs);
					res.end();
				}
			});
		});
	} else {
		models.event.find({}, 'GID title timestmp', {sort: {timestmp: -1}}).limit(count).execFind(function(err, docs){
			if(err){
				logger.error("Error listing events",err);
				send500(res);
			} else {
				res.json(docs);
				res.end();
			}
		});
	}
};

/**
 * Returns the series of events with the GID specified in the url:
 * /events/{GID}
 * Optionally, you can specify the number of comments to include with each event, up to 100
 */
this.getEventGroup = function(index, opts, res){
	models.event.find({GID:index}, null, {sort: {timestmp: -1}}).populate('contact').populate('location').exec(function(err, docs){
		if(err){
			logger.error("Error getting event group",err);
			send500(res);
		} else if(docs.length > 0){
			var arr = [];
			for(var i=0; i< docs.length; i++){
				var tmp = docs[i].toObject();
				//If comments were requested
				if(opts.comments){
					//Limit to 100
					if(opts.comments > 100){
						opts.comments = 100;
					}
					tmp.comments = docs[i].comments.slice(0,opts.comments);
				} else {
					tmp.comments = [];
				}
				tmp.numComments = docs[i].numComments;
				arr.push(tmp);
			}
			res.json(arr);
			res.end();			
		} else {
			general.send404(res);
		}
	});
};

/**
 * This returns the event with the ID specified in the URL. ID is a hexidecimal hash.
 * Optionally, cou can specify the number of comments to return with the event by adding
 * ?comments=# in the URL, up to 100. The default is not to include any.
 */
this.getEvent = function(index, opts, res){
	models.event.findById(index).populate('location').populate('contact').exec(function(err, docs){
		if(err){
			logger.error('Error getting event',err);
			send500(res);
		} else if(docs){
			var tmp = docs.toObject();
			tmp.numComments = docs.numComments;
			//If comments were requested to be included
			if(opts.comments){
				//Limit to 100
				if(opts.comments > 100){
					opts.comments = 100;
				}
				tmp.comments = tmp.comments.slice(0,opts.comments);
			} else {
				tmp.comments = [];
			}
			res.json(tmp);
			res.end();			
		} else {
			general.send404(res);
		}
	});
};

/**
 * Helper function to handle event.save()
 * (See createEvent)
 */
saveEvent = function(newEvent, res, io){
	logger.info("Event to be saved:",newEvent.toObject());
	newEvent.save(function(err){
		if(err){
			logger.error("Error creating event", err);
			general.send500(res);
		} else {
			res.json({id:newEvent._id, GID:newEvent.GID});
			res.end();
			//Broadcast to clients
			io.sockets.emit('event', {'GID':newEvent.GID, 'id':newEvent._id});
		}
	});
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
this.createEvent = function(data, res, io){
	var newEvent = new models.event(data);
	//Check if GID is set or not
	if(newEvent.GID == undefined || newEvent.GID == null){
		//Need to determine the GID now
		models.event.findOne({},'GID',{sort: {GID: -1}}, function(err,doc){
			if(err || !doc){
				//Uh-oh. Fail gracefully?
				logger.error("Error getting GID for new event, not saving", err);
				general.send500(res);
			} else {
				newEvent.GID = doc.GID + 1;
				//Save it now
				saveEvent(newEvent, res, io);
			}
		});
	} else {
		saveEvent(newEvent, res, io);
	}
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
	newEvent.save(function(err){
		if(err){
			logger.error('Error saving event', err);
			general.send500(res);
		} else {
			res.json({id:newEvent._id, GID:newEvent.GID});
			res.end();
			//Broadcast
			io.sockets.emit('event', {'GID':newEvent.GID, 'id':newEvent._id});
		}
	});
};

/**
 * This deletes the event with the id sepecified in the URL
 */
this.deleteEvent = function(id, res){
	models.event.find({_id:id}, function(err, docs){
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
	models.event.find({_id:index}, 'comments', {sort: {timestamp: -1}}, function(err, docs){
		if(err){
			logger.error('Error getting comments',err);
			send500(res);
		} else if(docs.length > 0){
			//Comments are sorted newest first
			res.json(docs[0].comments.slice(0,count));
			res.end();			
		} else {
			general.send404(res);
		};
	});
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
	models.event.find({_id:id}, 'comments GID', {sort: {timestamp: 1}}, function(err,docs){
		if(err || docs.length == 0){
			logger.error('Error adding comment',err);
			send500(res);
		} else {
			var newComment = new comment(req);
			docs[0].comments.push(newComment);
			docs[0].comments.sort(function(a,b){
				if(a.timestmp > b.timestmp){
					return -1;
				} else if(a.timestmp < b.timestmp){
					return 1;
				} else {
					return 0;
				}
			});
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
};

/**
 * Returns the location with the id specified in the URL
 */
this.getLocation = function(id, res){
	models.location.findById(id, function(err, docs){
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
};

/**
 * Returns a list of all the location ids and names
 */
this.listLocations = function(res){
	models.location.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing locations "+err);
			res.status(500);
			res.json({error: 'Error'});
		} else {
			res.json(docs);
		}
		res.end();
	});
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
	newLoc.save(function(err){
		if(err){
			logger.error('Error saving location', err);
			send500(res);
		} else {
			res.json({id:newLoc._id});
			res.end();
		}
	});
};


/**
 * This updates the location with id specified in the URL.
 * It will not change the id.
 * On success, it returns status:ok
 */
this.updateLocation = function(id, data, res){
	models.location.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting location "+err);
			general.send500(res);
		} else if(docs) {
			for(e in data){
				//Make sure not to change _id
				if(e != '_id'){
					docs[e] = data[e];
				}
			}
			docs.save(function(err){
				if(err){
					general.send500(res);
				} else {
					res.end({status:'ok'});
					res.end();
				}
			});
		} else {
			general.send404(res);
		}
	});
};

/**
 * Returns the contact object with id specified in the URL.
 */
this.getContact = function(id, res){
	models.contact.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting contact "+err);
			general.send500(res);
		} else if(docs) {
			res.json(docs);
		} else {
			general.send404(res);
		}
		res.end();
	});
};

/**
 * Returns a list of all the contact names and ids
 */
this.listContacts = function(res){
	models.contact.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing contacts "+err);
			general.send500(res);
		} else {
			res.json(docs);
		}
		res.end();
	});
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
	newContact.save(function(err){
		if(err){
			logger.error('Error saving contact',err);
			general.send500(res);
		} else {
			res.json({id:newContact._id});
			res.end();
		}
	});
};

/**
 * This updates the location with id specified in the URL.
 * It will not change the id.
 * On success, it returns status:ok
 */
this.updateContact = function(id, data, res){
	models.contact.findById(id, function(err, docs){
		if(err) {
			logger.info("Error getting contact "+err);
			general.send500(res);
		} else if(docs) {
			for(e in data){
				//Make sure not to change _id
				if(e != '_id'){
					docs[e] = data[e];
				}
			}
			docs.save(function(err){
				if(err){
					logger.error('Error updating contact',err);
					general.send500(res);
				}
				res.json({status:'ok'});
				res.end();
			});
		} else {
			general.send404(res);
		}
		res.end();
	});
};
