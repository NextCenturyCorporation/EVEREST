/**
 * A script that loads basic initial data into the database
 * This loads the same data that is loaded when run in no
 * database mode
 */

var models = require('./models.js');

this.load = function(){
	/**
	* Insert a location, contact, and event into memory
	*/
	//Initial contact
	var newContact = new models.contact();
	newContact.name = "George";
	newContact.email = "george@com.com";
	newContact.phone = "410-000-0000";
	newContact.save();
	
	console.log("Contact:");
	console.log(newContact);
	
	//Initial Location
	var newLoc = new models.location();
	newLoc.name = "Building A";
	newLoc.radius = 50;
	newLoc.latitude = 39.168051;
	newLoc.longitude = -76.809801;
	newLoc.save();
	
	console.log("Location:");
	console.log(newLoc);
	
	//Initial Event
	var newEvent = new models.event();
	newEvent.GID = 0;
	newEvent.title = "Edgardo!";
	newEvent.type= 'Emergency';
	newEvent.group = 0;
	newEvent.status = 'Ongoing';
	newEvent.description = 'Aah! Hes here!';
	newEvent.radius = 10;
	newEvent.location = newLoc._id;
	newEvent.contact = newContact._id;
	newEvent.save();
	
	console.log("Event:");
	console.log(newEvent);
};