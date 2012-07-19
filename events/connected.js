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
	models.event.find({}, ['GID', 'title', 'timestmp'], {sort: {timestmp: -1}}).limit(count).execFind(function(err, docs){
		if(err){
			logger.error("Error listing events",err);
			send500(res);
		} else {
			res.json(docs);
			res.end();
		}
	});
};

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
			send404(res);
		}
	});
};

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
			send404(res);
		}
	});
};

this.createEvent = function(data, res, io){
	var newEvent = new models.event(data);
	logger.info("Event to be saved:",newEvent);
	newEvent.save(function(err){
		if(err){
			logger.error("Error creating event", err);
			general.send500(res);
		} else {
			res.json({status:'success', id:newEvent._id});
			res.end();
			//Broadcast to clients?
			io.sockets.emit('event', {'GID':newEvent.GID, 'id':newEvent._id});
		}
	});
};

this.createGroupEvent = function(data, gid, res, io){
	var newEvent = new models.event(data);
	newEvent.GID = gid;
	logger.info('New event posted to GID '+newEvent.GID, newEvent.toObject());
	newEvent.save(function(err){
		if(err){
			logger.error('Error saving event', err);
			general.send500(res);
		} else {
			res.json({status:'success',id:newEvent._id});
			res.end();
			//Broadcast
			io.sockets.emit('event', {'GID':newEvent.GID, 'id':newEvent._id});
		}
	});
};


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

this.getComments = function(index, opts, res){
	var count = 10;
	if(opts.count){
		count = opts.count;
		//Limit to 100
		if(count > 100){
			count = 100;
		}
	}
	models.event.find({_id:index}, ['comments'], {sort: {timestamp: -1}}, function(err, docs){
		if(err){
			logger.error('Error getting comments',err);
			send500(res);
		} else if(docs.length > 0){
			//Comments are sorted newest first
			res.json(docs[0].comments.slice(0,count));
			res.end();			
		} else {
			send404(res);
		};
	});
};

this.getOptions = function(res){
	general.getOptions(res);
};


this.addComment = function(id, req, res, io){
	models.event.find({_id:id}, ['comments','GID'], {sort: {timestamp: 1}}, function(err,docs){
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

this.listLocations = function(res){
	models.location.find({},['_id', 'name'], function(err, docs){
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

this.createLocation = function(data, res){
	var newLoc = new models.location(data);
	newLoc.save(function(err){
		if(err){
			logger.error('Error saving location', err);
			send500(res);
		} else {
			res.json({status:'ok'});
			res.end();
		}
	});
};

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

this.listContacts = function(res){
	models.contact.find({},['_id', 'name'], function(err, docs){
		if(err){
			logger.info("Error listing contacts "+err);
			general.send500(res);
		} else {
			res.json(docs);
		}
		res.end();
	});
};

this.createContact = function(data, res){
	var newContact = new models.contact(data);
	newContact.save(function(err){
		if(err){
			logger.error('Error saving contact',err);
			general.send500(res);
		} else {
			res.json({status:'ok'});
			res.end();
		}
	});
};

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
