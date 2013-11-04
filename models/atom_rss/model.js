var mongoose = require('mongoose');
var Schema = mongoose.Schema;

 var atomRssModel = {
	createdDate: {type: Date, "default": Date.now},
	updatedDate: {type: Date, "default": Date.now},
	feed_url: {type: String, required: true},
	feed_active: {type: Boolean, "default": false, required: true},
	polling_interval: {type: Number, "default":300000}
};

var atomRssSchema = new Schema(atomRssModel);
var atomRss = mongoose.model('atomRss', atomRssSchema);
exports.atomRss = atomRss;
