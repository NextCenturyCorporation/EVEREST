
/**
 * Module dependencies.
 */

var express = require('express'),
	fs = require("fs");

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
		modules.push(file);
	}
});


//The index will list all modules
app.get('/', function(req, res){
	res.json(modules);
});

app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
