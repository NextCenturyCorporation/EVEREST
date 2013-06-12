var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var config = require('../../config.js');

this.assertionModel = {
		timestamp: {type: Date, default: Date.now},
		alpha_report_id: ObjectId
}
var AssertionSchema = new Schema(this.assertionModel);
this.assertion = mongoose.model('Assertion', AssertionSchema);