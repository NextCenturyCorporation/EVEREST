/*global require */
// require is a global node function/keyword

var express = require('express');
var winston = require('winston');
var socketio = require('socket.io');
var config = require('./config');
var mongoose = require('mongoose');
var gcm = require('node-gcm');

var app = module.exports = express.createServer();

//Use Socket.IO
var io = socketio.listen(app);
io.set('log level', 1);

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)({level:'info'}),
					new (winston.transports.File)({filename: 'logs/general.log'})]
});

logger.DO_LOG = true;

// Configuration
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/static'));
});

// allow jsonp to be used with a callback on REST calls
app.enable("jsonp callback");

/**
 * Custom error handler
 * This is modeled off the connect errorHandler
 * https://github.com/senchalabs/connect/blob/master/lib/middleware/errorHandler.js
 * http://stackoverflow.com/questions/7151487/error-handling-principles-for-nodejs-express-apps
**/
app.use(function errorHandler(err, req, res, next){
  if (err.status) res.statusCode = err.status;
  if (res.statusCode < 400) res.statusCode = 500;
  //Send back json
  res.setHeader('Content-Type', 'application/json');
  //Do not send the whole stack, could have security issues
  res.end(JSON.stringify({error: err.message}));
  logger.error('Error ', {stack: err.stack});
});

/**
 * Connect to the DB now, if we should at all.
 * Mongoose only needs to connect once, it will be shared
 * between all files
**/
if(!config.noDB){
	mongoose.connect('mongodb://' + config.db_host + ':' + config.db_port + '/' + config.db_collection);
	logger.warn('Connected to ' + config.db_host + ':' + config.db_port + '/' + config.db_collection);
}

//Load GCM
logger.debug('Loading GCM');
var gcm = require('./gcm/gcm.js');
gcm.load(app);

//Event routes
logger.debug('Loading events');
require('./services/router_service.js').load(app, io, gcm, logger);

if(config.noDB){
	logger.warn("Running in no-database mode, all data will be cleared on exit.");
}

app.listen(config.port, function(){
  logger.debug("Express server listening on port " + app.address().port + " in " + app.settings.env + " mode");
});