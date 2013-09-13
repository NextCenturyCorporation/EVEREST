/*global require */
// require is a global node function/keyword
var config = require('./config');


var winston = require('winston');
//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)({level:config.log_level}),
					new (winston.transports.File)({filename: 'logs/general.log'})]
});
logger.DO_LOG = true;


var mongoose = require('mongoose');
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


var app = require('express')();
var server = require('http').createServer(app);

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/static'));
	// allow jsonp to be used with jquery GET callback on REST calls
	app.enable("jsonp callback");

	/**
	 *  allow Cross-Origin Resource Sharing (CORS)
	 *  for cross domain access
	 */
	app.all('*', function(req, res, next){
		if (!req.get('Origin')) {
	 		return next();
	 	}
		// use "*" here to accept any origin
		res.set('Access-Control-Allow-Origin', '*');
		res.set('Access-Control-Allow-Methods', 'GET, POST', 'DEL', 'DELETE', 'PUT', 'SEARCH');
		res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
		// res.set('Access-Control-Allow-Max-Age', 3600);
		if ('OPTIONS' === req.method) {
			return res.send(200);
		}
		next();
	});

	/**
	 * Custom error handler
	 * This is modeled off the connect errorHandler
	 * https://github.com/senchalabs/connect/blob/master/lib/middleware/errorHandler.js
	 * http://stackoverflow.com/questions/7151487/error-handling-principles-for-nodejs-express-apps
	**/
	/* jshint -W098 */  // errorHandler signature needs to be the four params, even if they go unused
	app.use(function errorHandler(err, req, res, next){
		if (err.status) { 
			res.statusCode = err.status;
		}
		if (res.statusCode < 400) {
			res.statusCode = 500;
		}
		//Send back json
		res.setHeader('Content-Type', 'application/json');
		//Do not send the whole stack, could have security issues
		res.end(JSON.stringify({error: err.message}));
		logger.error('Error ', {stack: err.stack});
	});
});

var socketio = require('socket.io');
//Use Socket.IO
var io = socketio.listen(server);
io.set('log level', 1);

server.listen(config.port, function(){
  logger.debug("Express server listening on port " + app.address().port + " in " + app.settings.env + " mode");
});


//Event routes
logger.debug('Loading events');
var RouterService = require('./services/router_service.js');
var routerService = new RouterService(app, io, logger);