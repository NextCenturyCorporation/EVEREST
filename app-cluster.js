
/**
 * Module dependencies.
 */

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
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
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

//Routes
//Dummy routes
logger.info('Loading dummy');
require('./dummy/dummy.js').load(app);
//Event routes
logger.info('Loading events');
require('./events/router.js').load(app, io);
logger.info('Loading GCM');
require('./gcm/gcm.js').load(app);


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
