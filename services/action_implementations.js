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

	this.saveAlphaReportEventHandler = function() {
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'AlphaReport'});
		logger.debug('Emitted socket with item_saved for AlphaReport');

		serviceList.nlp_parser.parseAndSave.callWithAllArgs(arguments);
	};

	this.updateAlphaReportEventHandler = function() {
		serviceList.AlphaReport.updateAlphaReportX.callWithAllArgs(arguments);
	};

	this.validateAlphaReportEventHandler = function() {
		serviceList.AlphaReport.validateAlphaReport.callWithAllArgs(arguments);
	};

	this.rawFeedDataRecievedEventHandler = function() {
		//Services that are prototyped out must be called this way.
		var self = serviceList.RawFeed;
		self.create.apply(self, Array.prototype.slice.call(arguments[0], 0));
	};

	this.saveFeedEventHandler = function() {
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'RawFeed'});
		logger.debug('Emitted socket with item_saved for RawFeed');
	};

	this.rawFeedParseEventHandler = function() {
		serviceList.RawFeedParser.parseAndSave.callWithAllArgs(arguments);
	};

	this.saveAssertionEventHandler = function() {
		io.sockets.to('EVEREST.data.workflow').emit('item_saved', {type: 'Assertion'});
		logger.debug('Emitted socket with item_saved for Assertion');
	};

	//More Implemented event handlers below....
};