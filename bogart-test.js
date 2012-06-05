// This uses bogart. To install, run npm install bogart
// https://github.com/nrstott/bogart
var bogart = require('bogart');

var router = bogart.router();

//Handle the default request
router.get('/', function(req) {
	console.log("Request for /");
	return bogart.html("Hello, world!");
});


//Handle requests for /something
router.get('/:name', function(req){
	console.log("Request for "+req.params.name);
	return bogart.html("Hello "+req.params.name+"!");
});

//Return json
router.get('/json/:name', function(req){
	console.log('request for JSON '+req.params.name);
	return bogart.json({framework: 'Bogart', name: req.params.name});
});

//Set it up to run
var app = bogart.app();
//Not sure what this is for, but it crashes without it
app.use(bogart.batteries);
app.use(router);

//Start it
app.start(8080, '127.0.0.1');