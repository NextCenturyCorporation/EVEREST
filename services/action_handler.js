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
	return this.concat("Handler");
};

String.prototype.deHandlerify = function(){
	return this.substring(0, this.indexOf('Handler'));
};

var requiredServicesList = {};
var actionEmitter = require("./action_emitter.js");
var fs = require("fs");
//Comment this out if you want to just manually require each service
//this will just require every service defined in the database folder.

fs.readdirSync("services/database").forEach(function(file) {
	var filename = file.stripFileDesignation();
	requiredServicesList[filename] = require("./database/" + file);
});

fs.readdirSync("services/parsers").forEach(function(file) {
	var filename = file.stripFileDesignation();
	requiredServicesList[filename+"_parser"] = require("./parsers/" + file);
});


//If there are a large number of services and you only want to require a select few 
//you can define manually each one by simply following the paradigm below for each service you want to use.
//make sure that if you would like to manually include this files that you comment out
//the above loop to require all services
//**requiredServicesList['alpha_report'] = require("./database/alpha_report.js");**

module.exports = function(models, io, logger) {
	var serviceList = {};
	var self = this;
	//This loop will automatically create a new Object of the type of the service using standard Object notation
	//Example for alpha report it would call:
	//var AlphaReport = new requiredServicesList['alpha_report'](models,io,logger,actionEmitter);
	for(var service in requiredServicesList) {
		if(typeof(requiredServicesList[service.toString()]) === typeof(Function)) {//eval("var " + service.toObjectNotation() + "= new "+ "requiredServicesList['" + service + "'](models,io,logger);");
			serviceList[service.toObjectNotation()] = new requiredServicesList[service.toString()](models,io,logger);
		}
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////ll
	/**
	*All you have to do, is for an event defined in action_emitter create a function with the same name followed by 
	*"Handler" then you can call any of the methods defined in any of the services.
	*THIS IS THE ONLY FUNCTION YOU NEED TO MODIFY TO IMPLEMENT NEW EVENT HANDLERS.
	**/
	var Listener = function(){
		//This converts the arguments to an array so that any number of arguments can be passed to the method.
		Function.prototype.callWithAllArgs = function() {
			return this.apply(this, Array.prototype.slice.call(arguments[0][0], 0));
		};

	  	this.sampleListEventHandler = function() {
	  		serviceList.Profile.sampleProfileEvent.callWithAllArgs(arguments);
	  	};

  		this.saveAlphaReportEventHandler = function() {
  			io.sockets.in('EVEREST.data.workflow').emit('item_saved', {type: "AlphaReport"});
	  		logger.debug("Emitted socket with item_saved for AlphaReport");
	  	};

	  	this.updateAlphaReportEventHandler = function() {
  			serviceList.AlphaReport.updateAlphaReportX.callWithAllArgs(arguments);
	  	};

	  	this.validateAlphaReportEventHandler = function() {
  			serviceList.AlphaReport.validateAlphaReport.callWithAllArgs(arguments);
	  	};

  		this.twitterDataRecievedEventHandler = function() {
  			//Services that are prototyped out must be called this way.
  			var self = serviceList.RawFeed;
  			self.create.apply(self, Array.prototype.slice.call(arguments[0], 0));
	  	};

	  	this.saveFeedEventHandler = function() {
	  		io.sockets.in('EVEREST.data.workflow').emit('item_saved', {type: "RawFeed"});
	  		logger.debug("Emitted socket with item_saved for RawFeed");
	  	};

	  	this.rawFeedParseEventHandler = function() {
  			serviceList.RawFeedParser.parseAndSave.callWithAllArgs(arguments);
	  	};

	  	this.saveAssertionEventHandler = function() {
	  		io.sockets.in('EVEREST.data.workflow').emit('item_saved', {type: "Assertion"});
	  		logger.debug("Emitted socket with item_saved for Assertion");
	  	};
	  	

	  	//More Implemented event handlers below....
	};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var listener = new Listener();
	var eventerEventList = actionEmitter.eventList;

	//Sets up the corresponding Handlers for each event defined in the action_emitter.js file.
	for(var i = 0; i < eventerEventList.length; i++) {
		var currentEvent = eventerEventList[i];
		//For each event call the appropriate handler above.
		if(listener[currentEvent.handlerify()]) {
		 	actionEmitter.on(currentEvent,listener[currentEvent.handlerify()]);
		} else {
			//If there are events defined in action_emitter but no handler defined above, log an error.
			logger.error("There is no " + currentEvent.handlerify() + " defined in action_handler.js\n");
		}
	}

	//Checks if a handler is defined above, but no associated event in action_emitter.js.  Outputs an error if it cannot find the 
	//Associated Event for a Handler.
	for(var fun in listener) {
		if(eventerEventList.indexOf(fun.deHandlerify()) === -1 && fun !== 'callWithAllArgs') {
			logger.error("Handler:  " + fun + " defined but " + fun.deHandlerify() +" not defined in action_emitter.js \n");
		}
	}
};
