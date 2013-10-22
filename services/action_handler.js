String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toObjectNotation = function(){
	return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');}).capitalize();
};

String.prototype.stripFileDesignation = function(){
	return this.substring(0, this.indexOf('.'));
};

String.prototype.handlerify = function(){
	return this.concat('Handler');
};

String.prototype.deHandlerify = function(){
	return this.substring(0, this.indexOf('Handler'));
};

var requiredServicesList = {};
var actionEmitter = require('./action_emitter.js');
var fs = require('fs');
//Comment this out if you want to just manually require each service
//this will just require every service defined in the database folder.

fs.readdirSync('services/database').forEach(function(file) {
	var filename = file.stripFileDesignation();
	requiredServicesList[filename] = require('./database/' + file);
});

//TODO: Why aren't these in dot notation?  No special characters in the names, etc. 
requiredServicesList["assertion_to_titan"] = require('./parsers/assertion_to_titan.js');
requiredServicesList["atom_rss_to_alpha_report"] = require('./parsers/atom_rss_to_alpha_report.js');
requiredServicesList["nlp_parser_async"] = require('./parsers/nlp_parser_async.js');
requiredServicesList["raw_feed_parser"] = require('./parsers/raw_feed_parser.js');
requiredServicesList["twitter_to_alpha_report"] = require('./parsers/twitter_to_alpha_report.js');

//If there are a large number of services and you only want to require a select few 
//you can define manually each one by simply following the paradigm below for each service you want to use.
//make sure that if you would like to manually include this files that you comment out
//the above loop to require all services
//**requiredServicesList['alpha_report'] = require("./database/alpha_report.js");**

module.exports = function(models, io, logger) {
	var serviceList = {};
	//var self = this;
	//This loop will automatically create a new Object of the type of the service using standard Object notation
	//Example for alpha report it would call:
	//var AlphaReport = new requiredServicesList['alpha_report'](models,io,logger,actionEmitter);
	for(var service in requiredServicesList) {
		if(typeof(requiredServicesList[service.toString()]) === typeof(Function)) {//eval("var " + service.toObjectNotation() + "= new "+ "requiredServicesList['" + service + "'](models,io,logger);");
			serviceList[service.toObjectNotation()] = new requiredServicesList[service.toString()](models,io,logger);
		}
	}
	var Listener = require('./action_implementations.js');
	var listener = new Listener(serviceList, io, logger);

	var eventerEventList = actionEmitter.eventList;

	//Sets up the corresponding Handlers for each event defined in the action_emitter.js file.
	for(var i = 0; i < eventerEventList.length; i++) {
		var currentEvent = eventerEventList[i];
		//For each event call the appropriate handler above.
		if(listener[currentEvent.handlerify()]) {
			actionEmitter.on(currentEvent,listener[currentEvent.handlerify()]);
		} else {
			//If there are events defined in action_emitter but no handler defined above, log an error.
			logger.error('There is no ' + currentEvent.handlerify() + ' defined in action_handler.js\n');
		}
	}

	//Checks if a handler is defined above, but no associated event in action_emitter.js.  Outputs an error if it cannot find the 
	//Associated Event for a Handler.
	for(var fun in listener) {
		if(eventerEventList.indexOf(fun.deHandlerify()) === -1 && fun !== 'callWithAllArgs') {
			logger.error('Handler:  ' + fun + ' defined but ' + fun.deHandlerify() +' not defined in action_emitter.js \n');
		}
	}
};
