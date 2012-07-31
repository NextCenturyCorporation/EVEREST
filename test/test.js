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
			assert.equal(data[curElement] != null, true, curElement+' in '+dataType+' id '+data._id+' is null');
			//If its a DBRef, check that it is also complete
			if(model[curElement].ref){
				checkData(model[curElement].ref, data[curElement]);
			}
		}
	}
}

describe('Events:', function(){
	describe('Event List', function(){
		it('Getting event list', function(done){
			poster.urlReq('http://localhost:8081/events/', function(body, res){
				assert.equal(res.statusCode, 200);
				events = JSON.parse(body);
				done();
			});
		});
		it('Should contain between 0-10 events', function(done){
			assert.equal(events.length >= 0, true);
			assert.equal(events.length <= 10, true);
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
						assert.equal(res.statusCode, 200);
						cur = JSON.parse(body);
						//console.log(cur);
						done();
					});
				});
				//Now that the request has been completed, make sure it contains all the correct data
				it('Checking data -\t'+curId._id, function(done){
					assert(cur != null);
					checkData('event', cur);
					//TODO: Check that all the data is returned in the proper structure, IE
					// all the required fields are not null. Its not possible to check the exact values
					// simply because they are not known. A later test case should POST a full set of location/
					// contact/event and check that it is all returned correctly.
					done();
				});
			})(events[i]);
		}
		});
	});
});

describe('Locations:',function(){
	describe('Location List', function(){
		it('Getting location list', function(done){
			poster.urlReq('http://localhost:8081/location/', function(body, res){
				assert.equal(res.statusCode, 200);
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
						assert.equal(res.statusCode, 200);
						cur = JSON.parse(body);
						//console.log(cur);
						done();
					});
				});
				//Now that the request has been completed, make sure it contains all the correct data
				it('Checking data -\t\t'+curId._id, function(done){
					assert(cur != null);
					//TODO: Check that all the data is returned in the proper structure, IE
					// all the required fields are not null.
					checkData('location', cur);
					done();
				});
			})(locations[i]);
		}
		});
	});
});

describe('Contacts:',function(){
	describe('Contact List', function(){
		it('Getting contact list', function(done){
			poster.urlReq('http://localhost:8081/contact/', function(body, res){
				assert.equal(res.statusCode, 200);
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
						assert.equal(res.statusCode, 200);
						cur = JSON.parse(body);
						//console.log(cur);
						done();
					});
				});
				//Now that the request has been completed, make sure it contains all the correct data
				it('Checking data -\t'+curId._id, function(done){
					assert(cur != null);
					//TODO: Check that all the data is returned in the proper structure, IE
					// all the required fields are not null.
					checkData('contact', cur);
					done();
				});
			})(contacts[i]);
		}
		});
	});
});
