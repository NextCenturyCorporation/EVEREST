var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config.js');

this.confirmedReportModel = {
	timestamp: Date
};
var ConfirmedReportSchema = new Schema(this.confirmedReportModel);
this.confirmedReport = mongoose.model('ConfirmedReport', ConfirmedReportSchema);
