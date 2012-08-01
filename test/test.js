/**
 * Module to run basic API tests
 * To run, you need the mocha module installed globally:
 * sudo npm install -g mocha
 * 
 * Then either run mocha in the main Centurion directory, or
 * run 'npm test' in the main directory.
 */
var assert = require('assert');
var poster = require('./poster.js');
// For checking the data, we need to load the config and make sure it wont connect
var config = require('../config.js');
config.noDB = true;
// Now, load the data models
var models = require('../events/models.js');

//Testing data
var testData = require('./testData.js');


var events = null;
var locations = null;
var contacts = null;

/**
 * This function checks that all data marked as required
 * is not null.
 * It checks against the model definition
 */
function checkData(dataType, data){
	var model = models[dataType+'DataModel'];
	for(var curElement in model){
		if(model[curElement].required == true){
			assert(data[curElement] != null, curElement+' in '+dataType+' id '+data._id+' is null');
			//If its a DBRef, check that it is also complete
			if(model[curElement].ref){
				checkData(model[curElement].ref, data[curElement]);
			}
		}
	}
}

/**
 * Checking of the event list, and each event from the list
 */
describe('Test Getting Data:', function(){
	describe('Event List', function(){
		it('Getting event list', function(done){
			poster.urlReq('http://localhost:8081/events/', function(body, res){
				assert.equal(res.statusCode, 200, 'Didnt get a 200 response getting the event list');
				events = JSON.parse(body);
				done();
			});
		});
		it('Should contain between 0-10 events', function(done){
			assert.equal(events.length >= 0, true, 'Javascript is broken');
			assert.equal(events.length <= 10, true, 'More than 10 events in the list');
			done();
		});
	});
	after(function(){
		describe('Checking each event', function(){
		for(var i = 0; i < events.length; i++){
			//Need to avoid closure here, otherwise it pulls the same thing 10 times
			(function(curId){
				var cur = null;
				it('Getting event -\t'+curId._id, function(done){
					poster.urlReq('http://localhost:8081/events/'+curId._id, function(body,res){
						assert.equal(res.statusCode, 200, 'Didnt get a 200 response getting event '+curId._id);
						cur = JSON.parse(body);
						//console.log(cur);
						done();
					});
				});
				//Now that the request has been completed, make sure it contains all the correct data
				it('Checking data -\t'+curId._id, function(done){
					assert(cur != null, 'Event data null');
					checkData('event', cur);
					done();
				});
			})(events[i]);
		}
		});
	});
});

/**
 * Checking the location list, and each location
 */
describe('Locations:',function(){
	describe('Location List', function(){
		it('Getting location list', function(done){
			poster.urlReq('http://localhost:8081/location/', function(body, res){
				assert.equal(res.statusCode, 200, 'Didnt get a 200 response getting location list');
				locations = JSON.parse(body);
				done();
			});
		});
	});
	after(function(){
		describe('Checking each location', function(){
		for(var i = 0; i < locations.length; i++){
			//Need to avoid closure here, otherwise it pulls the same thing 10 times
			(function(curId){
				var cur = null;
				it('Getting location -\t'+curId._id, function(done){
					poster.urlReq('http://localhost:8081/location/'+curId._id, function(body,res){
						assert.equal(res.statusCode, 200, 'Didnt get a 200 response getting location '+curId._id);
						cur = JSON.parse(body);
						//console.log(cur);
						done();
					});
				});
				//Now that the request has been completed, make sure it contains all the correct data
				it('Checking data -\t\t'+curId._id, function(done){
					assert(cur != null, 'Location is null');
					// Check the data
					checkData('location', cur);
					done();
				});
			})(locations[i]);
		}
		});
	});
});

/**
 * Checking the contact list, and each contact
 */
describe('Contacts:',function(){
	describe('Contact List', function(){
		it('Getting contact list', function(done){
			poster.urlReq('http://localhost:8081/contact/', function(body, res){
				assert.equal(res.statusCode, 200, 'Didnt get a 200 response getting contact list');
				contacts = JSON.parse(body);
				done();
			});
		});
	});
	after(function(){
		describe('Checking each contact', function(){
		for(var i = 0; i < contacts.length; i++){
			//Need to avoid closure here, otherwise it pulls the same thing 10 times
			(function(curId){
				var cur = null;
				it('Getting contact -\t'+curId._id, function(done){
					poster.urlReq('http://localhost:8081/contact/'+curId._id, function(body,res){
						assert.equal(res.statusCode, 200, 'Didnt get a 200 response getting contact '+curId._id);
						cur = JSON.parse(body);
						//console.log(cur);
						done();
					});
				});
				//Now that the request has been completed, make sure it contains all the correct data
				it('Checking data -\t'+curId._id, function(done){
					assert(cur != null, 'Contact data null');
					// Check the data
					checkData('contact', cur);
					done();
				});
			})(contacts[i]);
		}
		});
	});
});


/**
 * In this section, actually post a contact, location, and event, and check that the returned data
 * matches what was sent.
 */
//Variables for response from POSTing data
var contactResponse = null;
var locationResponse = null;
var eventResponse = null;
//Variables for fetching the data after it was POSTed
var location = null;
var contact = null;
var event = null;
var eventGroup = null;

describe('Test Sending Data', function(){
	//Post location
	describe('Sending location', function(){
		it('Sending data', function(done){
			poster.urlReq('http://localhost:8081/location', {method:'POST',params:testData.location}, function(body, res){
				assert.equal(res.statusCode, 200, 'Didnt get a 200 response');
				locationResponse = JSON.parse(body);
				done();
			});
		});
		it('Checking for id in response', function(done){
			assert(locationResponse.id != null, 'No id in location response');
			//Add the id to the event
			testData.event.location = locationResponse.id;
			done();
		});
	});
	//Post contact
	describe('Sending Contact',function(){
		it('Sending data', function(done){
			poster.urlReq('http://localhost:8081/contact', {method:'POST',params:testData.contact}, function(body, res){
				assert.equal(res.statusCode, 200, 'Didnt get a 200 response');
				contactResponse = JSON.parse(body);
				done();
			});
		});
		it('Checking for id in response', function(done){
			assert(contactResponse.id != null, 'No id in contact response');
			//Add the ID to the event
			testData.event.contact = contactResponse.id;
			done();
		});
	});
	//Post event
	describe('Sending Event',function(){
		it('Sending data', function(done){
			poster.urlReq('http://localhost:8081/events', {method:'POST',params:testData.event}, function(body, res){
				assert.equal(res.statusCode, 200, 'Didnt get a 200 response');
				eventResponse = JSON.parse(body);
				done();
			});
		});
		it('Checking for id and GID in response', function(done){
			assert(eventResponse.id != null, 'No id in event response');
			assert(eventResponse.GID != null, 'No GID in event response');
			done();
		});
	});
	after(function(){
		describe('Getting sent data', function(){
			//Get and check the location
			it('Getting location', function(done){
				poster.urlReq('http://localhost:8081/location/'+locationResponse.id, function(body, res){
					assert(res.statusCode == 200, 'Error getting POSTed location');
					location = JSON.parse(body);
					done();
				});
			});
			it('Verifying location', function(done){
				testData.verifyLocation(location);
				done();
			});
			//Get and check the contact
			it('Getting contact', function(done){
				poster.urlReq('http://localhost:8081/contact/'+contactResponse.id, function(body, res){
					assert(res.statusCode == 200, 'Error getting POSTed contact');
					contact = JSON.parse(body);
					done();
				});
			});
			it('Verifying contact', function(done){
				testData.verifyContact(contact);
				done();
			});
			//Get and check the event
			it('Getting event', function(done){
				poster.urlReq('http://localhost:8081/events/'+eventResponse.id, function(body, res){
					assert(res.statusCode == 200, 'Error getting POSTed event');
					event = JSON.parse(body);
					done();
				});
			});
			it('Verifying event', function(done){
				testData.verifyEvent(event);
				done();
			});
			//Check that the event group returned only has one event
			it('Getting event group '+eventResponse.GID, function(done){
				poster.urlReq('http://localhost:8081/events/'+eventResponse.GID, function(body, res){
					assert(res.statusCode == 200, 'Error getting POSTed event group');
					eventGroup = JSON.parse(body);
					done();
				});
			});
			it('Verifing that event group '+eventResponse.GID+' has one event', function(done){
				assert(eventGroup.length == 1, 'New event group doesnt have 1 single event');
				done();
			});
			//Also, make sure that the event group view also displays the event correctly
			it('Verifing the event from event group '+eventResponse.GID, function(done){
				testData.verifyEvent(eventGroup[0]);
				done();
			});
			it('Verifying that GID and ID events match', function(done){
				//Now, make sure that it is the same as getting from the ID
				testData.compareEvents(event, eventGroup[0]);
				done();
			});
		});
	});
});
