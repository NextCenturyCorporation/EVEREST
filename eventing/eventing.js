var Events = require('events');
var Util = require('util');

var eventingLogModel = require('./eventing_log/model.js');

var winston = require('winston');
var logger = new (winston.Logger)({
	//Make it log to both the console and a file
	transports : [new (winston.transports.Console)({level:'debug'}),
					new (winston.transports.File)({filename: 'logs/eventing.log'})]
});

var Eventing = function() {
	var me = this;

	Events.EventEmitter.call(this);

	me.fire = function(eventName, data, pastEvents) {
		var evt = {};
		evt.pastEvents = (typeof(pastEvents) !== 'undefined' ? pastEvents : []);

		//TODO save event to db and get id
		var newEventLog = new eventingLogModel.eventingLog({
			event_type: eventName,
			pastEvents: evt.pastEvents
		});
		newEventLog.save(function(err) {
			if (err) {
				logger.error("Error saving eventing log ", err);
			} else {
				logger.debug("saved eventing log " + newEventLog._id);
			}
			me.emit(eventName, evt, data);
		});
	};

	//module calls on() with some function, so there is no need to have a reference to anything that is not given to us.
};

Util.inherits(Eventing, Events.EventEmitter);
var eventing = new Eventing();
module.exports = eventing;