var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var config = require('../../config.js');

this.eventModel = {
	timestmp: {type: Date, default: Date.now},
	confirmed_report_ids: [ObjectId]
};
var EventSchema = new Schema(this.eventModel);
this.event = mongoose.model('Event', EventSchema);
