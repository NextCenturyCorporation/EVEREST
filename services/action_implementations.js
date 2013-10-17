/**
*All you have to do, is for an event defined in action_emitter create a function with the same name followed by 
*"Handler" then you can call any of the methods defined in any of the services.
*THIS IS THE ONLY FUNCTION YOU NEED TO MODIFY TO IMPLEMENT NEW EVENT HANDLERS.
**/
module.exports = function(serviceList, io ,logger){
	//This converts the arguments to an array so that any number of arguments can be passed to the method.
	Function.prototype.callWithAllArgs = function() {
		return this.apply(this, Array.prototype.slice.call(arguments[0][0], 0));
	};

	this.rawFeedDataRecievedEventHandler = function() {
		//Services that are prototyped out must be called this way.
		var self = serviceList.RawFeed;
		self.create.apply(self, Array.prototype.slice.call(arguments[0], 0));
	};

	this.rawFeedParseEventHandler = function() {
		serviceList.RawFeedParser.parseAndSave.callWithAllArgs(arguments);
	};

	this.saveAlphaReportEventHandler = function() {
		var args = Array.prototype.slice.call(arguments[0], 0);
		var obj = args[0];
		if(obj.data) {
			obj = obj.data;
		}
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'AlphaReport', eventObject: obj});
		logger.debug('Emitted socket with item_saved for AlphaReport');
		serviceList.NlpParserAsync.parseAndSave.callWithAllArgs(arguments);
	};

	this.saveAssertionEventHandler = function() {
		var args = Array.prototype.slice.call(arguments[0], 0);
		var obj = args[0];
		if(obj.data) {
			obj = obj.data;
		}
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'Assertion', eventObject: obj});
		logger.debug('Emitted socket with item_saved for Assertion');
	};

	this.saveFeedEventHandler = function() {
		var args = Array.prototype.slice.call(arguments[0], 0);
		var obj = args[0];
		if(obj.data) {
			obj = obj.data;
		}
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'RawFeed', eventObject: obj});
		logger.debug('Emitted socket with item_saved for RawFeed');
	};

	this.updateAlphaReportEventHandler = function() {
		serviceList.AlphaReport.updateAlphaReportX.callWithAllArgs(arguments);
	};

	this.validateAlphaReportEventHandler = function() {
		serviceList.AlphaReport.validateAlphaReport.callWithAllArgs(arguments);
	};

	//More Implemented event handlers below....
};