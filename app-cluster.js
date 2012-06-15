
/**
 * Module dependencies.
 */

var express = require('express'),
	fs = require("fs");

/**
 * Needed modules:
 * express
 * npm install -g express
 */

var app = module.exports = express.createServer();

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
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var modules = [];
// Routes
//Load all the routes from the ./modules/ directory
fs.readdirSync("./modules").forEach(function(file) {
	if(!fs.lstatSync('./modules/'+file).isDirectory()){
		console.log('Loading '+file);
		require("./modules/" + file).load_mod(app);
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

//Need to use this body parser so it will get the properties for us
app.use(express.bodyParser());

/*
app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
*/

/*
 * Using cluster to run this one
 * Note for windows with cygwin: After this is started and killed, you will need to go through the task manager and kill all the node.exe processes
 * If you dont, it will crash with IPC error
 */
var cluster = require('cluster');
if(cluster.isMaster){
	//Expand to 4 cores
	for(var i = 0; i<4; i++)
		cluster.fork();
} else {
	app.listen(8081, function(){
		  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
		});
}