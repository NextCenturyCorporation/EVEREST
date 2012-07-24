var data = require('./data.js');
var poster = require('./poster.js');

var count = data.numEvents();


var sendEvent = function(curEvent){
	console.log(curEvent);
	poster.urlReq('http://localhost:8081/events/',
			{method: 'POST',params: curEvent},
			function(body,res){
				console.log(eval('('+body+')'));
			});
};

var totalWait = 0;
var factor = 1;
if(process.argv[2]){
	var tmp = parseFloat(process.argv[2]);
	if(tmp > 1){
		factor = tmp;
	}
}
//Get the contact and location ready
poster.urlReq('http://localhost:8081/location/',
{method:'POST', params:data.location}, function(body,res){
	var locInfo = eval('('+body+')');
	console.log('Location info:');
	console.log(locInfo);
	//Now, set up the contact
	poster.urlReq('http://localhost:8081/contact/',
		{method:'POST',params:data.contact},function(body,res){
			var contactInfo = eval('('+body+')');
			console.log('Contact info:');
			console.log(contactInfo);
			//Now, send all the events
			for(var i =0; i < count; i++){
				var cur = data.getEvent(i);
				cur.contact = contactInfo.id;
				cur.location = locInfo.id;
				//Now, sleep for the time between this and the next event
				var next = data.getEvent(i+1);
				if(next != null){
					//Start a timer to send the event
					setTimeout(sendEvent, totalWait, cur);
					//Keep tack of all the wait times
					totalWait = totalWait + ( Math.abs(cur.timestmp - next.timestmp) / factor);
					console.log(totalWait/1000);
				}
			}
			//Last event
			setTimeout(sendEvent, totalWait, data.getEvent(count -1));
		});
});
