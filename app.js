
/**
 * Module dependencies.
 */

var express = require('express'),
	winston = require('winston'),
	socketio = require('socket.io'),
	config = require('./config'),
	mongoose = require('mongoose');

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
//	exceptionHandlers: [new winston.transports.File({filename: 'logs/exceptions.log'}),
//	                    new (winston.transports.Console)()]
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

// Routes
// Dummy routes
logger.info('Loading dummy');
require('./dummy/dummy.js').load(app);
// Event routes
logger.info('Loading events');
require('./events/router.js').load(app, io);


if(config.noDB){
	logger.info("Running in no-database mode, all data will be cleared on exit.");
}


//The index will list all modules
app.get('/', function(req, res){
	res.json({something:'Idk'});
	res.end();
});

app.listen(config.port, function(){
  logger.info("Express server listening on port "+app.address().port+" in "+app.settings.env+" mode");
});
