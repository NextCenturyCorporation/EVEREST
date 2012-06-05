//Basic Event class
function Event(id, name, time, place){
	this.id = id;
	this.name = name;
	this.time = time;
	this.place = place;
	this.toJSON = function(){
		return {id: this.id, name: this.name, time: this.time, place: this.place};
	};
};


//Array of events
var events=[new Event(0, 'Fire', '12:04PM', 'Building'),
            new Event(1, 'Bomb', '12:05PM', 'Field'),
            new Event(2, 'Flood', '3:00PM', 'Everywhere')];


// This uses bogart. To install, run npm install bogart
// https://github.com/nrstott/bogart
var bogart = require('bogart');

var router = bogart.router();

router.get('/', function(req){
	console.log('Request for /');
	return bogart.json({modules: mods});
});


//Send the number of events
router.get('/events/?', function(req){
	console.log('Request for list of events');
	return bogart.json({count: events.length});
});

//And set up to return the JSON for each one
router.get('/events/:id', function(req){
	console.log('Request for event # '+req.params.id);
	if(req.params.id < events.length){
		return bogart.json(events[req.params.id].toJSON());
	} else {
		return bogart.error();
	}
});



//Set it up to run
var app = bogart.app();
app.use(bogart.batteries);
app.use(router);

//Start it
app.start(8080, '127.0.0.1');