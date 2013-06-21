/*global require*/
// Identify require as a global function/keyword for JSHint

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var config = require('../../config.js');

this.alphaReportModel = {
	timestamp:	{type: Date, "default": Date.now},
	date: Date
};
var AlphaReportSchema = new Schema(this.alphaReportModel);
this.alphaReport = mongoose.model('AlphaReport', AlphaReportSchema);