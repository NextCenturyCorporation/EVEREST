/**
 * Handles the routing
 */
var winston = require('winston');
var config = require('../config.js');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
					new (winston.transports.File)({filename: 'logs/general.log'})]
});

var LOG = true;

this.dataManager = null;

this.load = function() {
	
	//Determine how to manage the events
	if(config.noDB){
		//Use the local version
		this.dataManager = require('./local_data_service.js');
	} else {
		//Connect to the database
		this.dataManager = require('./database_service.js');
	}
	
	return this.dataManager;
}