
/**
 * Module dependencies.
 */

var express = require('express'),
	fs = require("fs"),
	winston = require('winston'),
	socketio = require('socket.io'),
	events = require('events');

var app = module.exports = express.createServer();
//Use Socket.IO
var io = socketio.listen(app);

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
	              new (winston.transports.File)({filename: 'logs/general.log'})],
	//Log uncought exceptions to a seperate log
	//exceptionHandlers: [new winston.transports.File({filename: 'logs/exceptions.log'}),
	//                    new (winston.transports.Console)()]
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
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

//Use a EventEmitter to broadcast to the clients
var emitter = new events.EventEmitter();

/*//Set up Socket.IO to actually send crap
io.sockets.on('connection', function(socket){
	socket.emit('Hello',{text:'this is text'});
	
	emitter.on('event', function(data){
		socket.emit('event',data);
	});
	emitter.on('comment', function(data){
		socket.emit('comment', data);
	});
});*/

var modules = [];
// Routes
//Load all the routes from the ./modules/ directory
fs.readdirSync("./modules").forEach(function(file) {
	if(!fs.lstatSync('./modules/'+file).isDirectory()){
		logger.info('Loading '+file);
		require("./modules/" + file).load_mod(app, logger, io);
		file = file + "";
		//Cut off the extension, its not part of the URL
		modules.push(file.substring(0, file.indexOf('.')));
	}
});


//The index will list all modules
app.get('/', function(req, res){
	res.json({modules: modules});
	res.end();
});

app.listen((process.env.port || 8081), function(){
  logger.info("Express server listening on port "+app.address().port+" in "+app.settings.env+" mode");
});
