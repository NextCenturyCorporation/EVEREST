var responseHandler = require('../wizard_service');

var ConfirmedReport = module.exports = function(models, log) {
	var me = this;

	me.logger = log;
	me.models = models;
};

ConfirmedReport.prototype.listRequest = function(params, res) {
	var me = this;

	me.list({}, function(err, reports) {
		if(err) {
			var errMsg = "Error attempting to list confirmed reports"
			me.logger.error("confirmedReport: " + errMsg, err)
			responseHandler.send500(res, errMsg);
		} else {
			res.json(reports);
			res.end();
		}
	});
};

ConfirmedReport.prototype.listFlattenedRequest = function() {
	var me = this;
};

ConfirmedReport.prototype.list = function(params, listCallback) {
	var me = this;

	me.models.confirmedReport.find(params, function(err, confirmedReports) {
		if(err) {
			//FIXME
		} else {
			listCallback(confirmedReports);
		}
	});
};

ConfirmedReport.prototype.getRequest = function(id, res) {
	var me = this;

	me.get()
};

ConfirmedReport.prototype.get = function() {
	var me = this;
};

ConfirmedReport.prototype.getFlattenedRequest = function(req, res) {
	var me = this;
};

ConfirmedReport.prototype.flattenConfirmedReports = function(reports, callback) {
	var me = this;
};

ConfirmedReport.prototype.createRequest = function() {

};

ConfirmedReport.prototype.create = function() {

};

ConfirmedReport.prototype.updateRequest = funtion() {

};

ConfirmedReport.prototype.update = function() {

};

ConfirmedReport.prototype.deleteRequest = function() {

};

ConfirmedReport.prototype.deleteAllRequest = function() {

};

ConfirmedReport.prototype.delete = function(paramsObject) {

};