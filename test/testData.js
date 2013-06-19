/**
 * This contains the data that will be POSTed to the server while running API tests
 */
/*global require */
// require is a global node function/keyword

var assert = require('assert');


/**
 * A location to test
 */
this.location = {
		name		:	"API Testing Location",
		latitude	:	39.168022,
		longitude	:	-76.810785,
		radius		:	10
	};

/**
 * Testing contact
 */
this.contact = {
		name		:	"API Testing Contact",
		email		:	"APT@Testing.com",
		phone		:	"1-800-TEST-API"
	};

/**
 * Testing event
 * The id from the contact and location will need to be added
 */
this.event = {
		title		:	"API Testing Event",
		type		:	'Information',
		group		:	0,
		status		:	'Ongoing',
		description	:	"This will be POSTed to test the API",
		radius		:	5
//		radius		:	5,
	};

/**
 * Function to verify that the location data passed matches the data in the file
 */
this.verifyLocation = function(data){
	for(var curElement in this.location){
		assert.equal(this.location[curElement], data[curElement], curElement+' in location is not the expected value');
	}
};

/**
 * Compares everything in each location
 */
this.compareLocations = function(location1, location2){
	for(var curElement in location1){
		assert.equal(location1[curElement], location2[curElement], curElement+' is not the same in both locations');
	}
	//Check all elements in location2, in case something is missing
	//for(var curElement in location2){
	for(curElement in location2){
		assert.equal(location1[curElement], location2[curElement], curElement+' is not the same in both locations');
	}
};

/**
 * Function to verify that the contact data passed matches the data in the file
 */
this.verifyContact = function(data){
	for(var curElement in this.contact){
		assert.equal(this.contact[curElement], data[curElement], curElement+' in contact is not the expected value');
	}
};

/**
 * Compares everything in each contact
 */
this.compareContacts = function(contact1, contact2){
	for(var curElement in contact1){
		assert.equal(contact1[curElement], contact2[curElement], curElement+' is not the same in both contacts');
	}
	//Check all elements in contact2, in case something is missing
	//for(var curElement in contact2){
	for(curElement in contact2){
		assert.equal(contact1[curElement], contact2[curElement], curElement+' is not the same in both contacts');
	}
};

/**
 * Function to verify that the event data passed matches the data in the file.
 * This is different because it has to check the embedded objects
 */
this.verifyEvent = function(data){
	for(var curElement in this.event){
		if(curElement == 'contact'){
			this.verifyContact(data.contact);
		} else if(curElement == 'location'){
			this.verifyLocation(data.location);
		} else {
			assert.equal(this.event[curElement], data[curElement], curElement+' in event is not the expected value');
		}
	}
};

/**
 * Compares everything in 2 events
 */
this.compareEvents = function(event1, event2){
	for(var curElement in event1){
		if(curElement == 'contact'){
			this.compareContacts(event1.contact, event2.contact);
		} else if(curElement == 'location'){
			this.compareLocations(event1.location, event2.location);
		} else if(curElement == 'comments'){
			assert.equal(event1.comments.length, event2.comments.length, 'Different number of comments in both events');
		} else {
			assert.equal(event1[curElement], event2[curElement], curElement+' in event is not the same in both events');
		}
	}
	//Check everything in event2, in case something is missing
	//for(var curElement in event2){
	for(curElement in event2){
		if(curElement == 'contact'){
			this.compareContacts(event1.contact, event2.contact);
		} else if(curElement == 'location'){
			this.compareLocations(event1.location, event2.location);
		} else if(curElement == 'comments'){
			assert.equal(event1.comments.length, event2.comments.length, 'Different number of comments in both events');
		} else {
			assert.equal(event1[curElement], event2[curElement], curElement+' in event is not the same in both events');
		}
	}
};