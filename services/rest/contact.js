/*global require*/
// Identify require as a global function/keyword for JSHint
/*
var contactService = require('../database/contact.js');

this.load = function(app, io, gcm, logger) {
	app.get('/contact/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for contact "+req.params.id);
		}
		contactService.getContact(req.params.id, res);
	});
	
	//Get a list of all the contacts in the system
	app.get('/contact/', function(req, res){
		if(logger.DO_LOG){
			logger.info("Request for contact list");
		}
		contactService.listContacts(res);
	});
	
	//Create a new contact
	app.post('/contact/?', function(req, res){
		if(logger.DO_LOG){
			logger.info("Receiving new contact",req.body);
		}
		contactService.createContact(req.body, res);
	});
	
	//Update a contact
	app.post('/contact/:id([0-9a-f]+)', function(req,res){
		if(logger.DO_LOG){
			logger.info("Update contact "+req.params.id);
		}
		contactService.updateContact(req.params.id, req.body, res);
	});
	
	app.del('/contact/:id([0-9a-f]+)', function(req, res){
		if(logger.DO_LOG) {
			logger.info("Deleting contact " + req.params.id);
		}
		// bbn 20-JUN-13  change calling signature to match changed db call
		//contactService.deleteContact(req.params.id, req.body, res);
		contactService.deleteContact(req.params.id, res);
	});
};*/