/**
 * Runs while connected to a database
 */

/*global require */
// require is a global node function/keyword

var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * Returns a list of the last <count> events, where count = 10 or
 * was specified in the URL with ?count=#, up to 100
 *
 * EDIT: Instead of returning 10 events by default, we decided that for now,
 * having all events returned by default is more appropriate. This code is
 * subject to change.
 */
this.listEvents = function(opts, res){
	var count = undefined;
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
			if(count == undefined){
				models.event.find({timestmp: {$gt: doc.timestmp}}, 'GID title timestmp', {sort: {timestmp: -1}}).
					execFind(function(err, docs){
						if(err){
							logger.error("Error listing events",err);
							general.send500(res);
						} else {
							res.json(docs);
							res.end();
						}
					});
			} else {
				models.event.find({timestmp: {$gt: doc.timestmp}}, 'GID title timestmp', {sort: {timestmp: -1}}).
					limit(count).execFind(function(err, docs){
						if(err){
							logger.error("Error listing events",err);
							general.send500(res);
						} else {
							res.json(docs);
							res.end();
						}
					});
			}
		});
	} else {
		models.event.find({}, 'GID title timestmp', {sort: {timestmp: -1}}).limit(count).execFind(function(err, docs){
			if(err){
				logger.error("Error listing events",err);
				general.send500(res);
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
			general.send500(res);
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
			general.send500(res);
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
saveEvent = function(newEvent, res, io, gcm){
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
			gcm.sendEvent(newEvent.title, newEvent._id, newEvent.GID);
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
this.createEvent = function(data, res, io, gcm){
	var newEvent = new models.event(data);
	//Check if GID is set or not
	if(newEvent.GID === undefined || newEvent.GID === null){
		//Need to determine the GID now
		/*models.event.findOne({},'GID',{sort: {GID: -1}}, function(err,doc){
			if(err || !doc){
				//Uh-oh. Fail gracefully?
				logger.error("Error getting GID for new event, not saving", err);
				general.send500(res);
			} else {
				newEvent.GID = doc.GID + 1;
				//Save it now
				saveEvent(newEvent, res, io, gcm);
			}
		});*/
		
		newEvent.GID = newEvent._id;
		saveEvent(newEvent, res, io, gcm);
	} else {
		saveEvent(newEvent, res, io, gcm);
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
this.createGroupEvent = function(data, gid, res, io, gcm){
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
			gcm.sendEvent(newEvent.title, newEvent._id, newEvent.GID);
		}
	});
};

/**
 * This deletes the event with the id sepecified in the URL
 */
this.deleteEvent = function(id, res){
	models.event.find({_id:id}, function(err, docs){
		if(err || docs.length === 0){
			logger.error('Error deleting event', err);
			general.send500(res);
		} else {
			for(var i = 0; i < docs.length; i++){
				docs[i].remove();
			}
			res.json({status:'OK'});
			res.end();
		}//;
	});
};
