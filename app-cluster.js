
/**
 * Module dependencies.
 */

/*global require */
// require is a global node function/keyword

var express = require('express'),
	fs = require("fs"),
	winston = require('winston'),
	socketio = require('socket.io'),
	config = require('./config'),
	mongoose = require('mongoose'),
	gcm = require('node-gcm');

var numThreads = process.env.numThreads || require('os').cpus().length;

/**
 * Needed modules:
 * express
 * npm install -g express
 */

var app = module.exports = express.createServer();
//Use Socket.IO
var io = socketio.listen(app);
io.set('log level', 1);

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
					new (winston.transports.File)({filename: 'logs/general.log'})],
	//Log uncought exceptions to a seperate log
	exceptionHandlers: [new winston.transports.File({filename: 'logs/exceptions.log'}),
						new (winston.transports.Console)()]
});

// Configuration
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
});

app.configure('development', function(){
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  //app.use(express.errorHandler());
});

//allow jsonp to be used with a callback on REST calls
app.enable("jsonp callback");

/**
 *  allow Cross-Origin Resource Sharing (CORS)
 *  for cross domain access
 */

app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  // use "*" here to accept any origin
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST', 'DEL', 'DELETE', 'PUT', 'SEARCH');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});


//Custom error handler
//This is modeled off the connect errorHandler
//https://github.com/senchalabs/connect/blob/master/lib/middleware/errorHandler.js
// http://stackoverflow.com/questions/7151487/error-handling-principles-for-nodejs-express-apps
app.use(function errorHandler(err, req, res, next){
  if (err.status) res.statusCode = err.status;
  if (res.statusCode < 400) res.statusCode = 500;
  //Send back json
  res.setHeader('Content-Type', 'application/json');
  //Dont send the whole stack, could have security issues
  res.end(JSON.stringify({error: err.message}));
  //Log it
  logger.log('error', 'Error ', {stack: err.stack});
});

/**
 * Connect to the DB now, if we should at all.
 * Mongoose only needs to connect once, it will be shared
 * between all files
**/
if(!config.noDB){
	var connectString = 'mongodb://' + config.db_host + ':' + config.db_port + '/' + config.db_collection;
	mongoose.connect(connectString, function(err) {
		if (err !== undefined) {
			logger.error('Unable to connect to ' + connectString);
			throw err;
		} else {
			logger.warn('Connected to ' + connectString);			
		}
	});
}

// Routes
// Dummy routes
logger.info('Loading dummy');
require('./dummy/dummy.js').load(app);
//Load GCM
logger.info('Loading GCM');
var gcm = require('./gcm/gcm.js');
gcm.load(app);
//Event routes
logger.info('Loading events');
require('./events/router.js').load(app, io, gcm);


if(config.noDB){
	logger.info("Running in no-database mode, all data will be cleared on exit.");
}

/*
 * Using cluster to run this one
 * Note for windows with cygwin: After this is started and killed, you will need to go through the task manager and kill all the node.exe processes
 * If you dont, it will crash with IPC error
 */
var cluster = require('cluster');
if(!config.noDB){
	if(cluster.isMaster){
		logger.info("Starting "+numThreads+" threads");
		//Expand to all cores
		for(var i = 0; i<numThreads; i++)
			cluster.fork();
	} else {
		app.listen(config.port, function(){
			logger.info("Express server listening on port "+app.address().port+" in "+app.settings.env+" mode");
			});
	}
} else {
	logger.warn('Sorry, can not use multiple threads in no database mode. Because Node.js doesn\'t support shared memory, the threads'+
			' will have inconsistant data. Falling back to one thread.');
	app.listen(config.port, function(){
		logger.info("Express server listening on port "+app.address().port+" in "+app.settings.env+" mode");
		});
}
