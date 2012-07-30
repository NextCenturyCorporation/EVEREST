/**
 * Program to run a simulation
 */

var data = require('./data.js');
var poster = require('./poster.js');

var count = data.numEvents();

/**
 * Function to POST an event to the server.
 * It checks if the location the event uses has been sent, and
 * if it hasn't, it will send the location before the new event.
 */
var sendEvent = function(curEvent){
	if(data.location[curEvent.location].id == null){
		//Need to send the location, then the event
		poster.urlReq('http://localhost:8081/location/',
				{method: 'POST',params: data.location[curEvent.location]},
				function(body,res){
					var tmp = eval('('+body+')');
					console.log('New location response:');
					console.log(tmp);
					data.location[curEvent.location].id = tmp.id;
					curEvent.location = tmp.id;
					//Now send it
					poster.urlReq('http://localhost:8081/events/',
							{method: 'POST',params: curEvent},
							function(body,res){
								console.log('New event response:');
								console.log(eval('('+body+')'));
							});
				});
	} else {
		//Location has already been posed, use the ID
		curEvent.location = data.location[curEvent.location].id;
		console.log(curEvent);
		poster.urlReq('http://localhost:8081/events/',
			{method: 'POST',params: curEvent},
			function(body,res){
				console.log('New event response:');
				console.log(eval('('+body+')'));
			});
	}
};

/**
 * Read the arguments.
 * If there are not 5, exit and print how to run
 */
if(process.argv.length != 5){
	console.log("Error - missing arguments.");
	console.log("Usage: ");
	console.log(process.argv[1]+' <Hostname> <Port> <Speedup factor>');
	process.exit(-1);
}
//Set up hostname
var hostname = process.argv[2];
//Set up port
var port = process.argv[3];
//Speedup factor must be > 1
var factor = 1;
var tmp = parseFloat(process.argv[4]);
if(tmp > 1){
	factor = tmp;
}

//Time to delay sending each event
var totalWait = 0;


//Get the contact ready
poster.urlReq('http://localhost:8081/contact/',
	{method:'POST',params:data.contact},function(body,res){
		var contactInfo = eval('('+body+')');
		console.log('Contact info:');
		console.log(contactInfo);
		//Now, send all the events
		console.log('Seconds to wait before before each event:');
		for(var i =0; i < count; i++){
			var cur = data.getEvent(i);
			cur.contact = contactInfo.id;
			//Now, sleep for the time between this and the next event
			var next = data.getEvent(i+1);
			if(next != null){
				//Start a timer to send the event
				setTimeout(sendEvent, totalWait, cur);
				//Keep tack of all the wait times
				totalWait = totalWait + ( Math.abs(cur.timestmp - next.timestmp) / factor);
				console.log('Event '+i+' - '+totalWait/1000);
			}
		}
		//Last event
		setTimeout(sendEvent, totalWait, data.getEvent(count -1));
	});
