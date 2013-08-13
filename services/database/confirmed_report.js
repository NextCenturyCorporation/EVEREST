var ConfirmedReport = module.exports = function(models, io, log) {
	var me = this;

	me.logger = log;
	me.models = models;
	me.io = io;
};

ConfirmedReport.prototype.listFlattened = function(params, listFlatCallback) {
	var me = this;
};

ConfirmedReport.prototype.list = function(params, listCallback) {
	var me = this;

	me.models.confirmedReport.find(params, function(err, confirmedReports) {
		if(err) {
			var errMsg = "Error in retrieving list of confirmed reports";
			me.logger.error("confirmeedReport: " + errMsg, err);
		} 
		
		listCallback(err, confirmedReports);
	});
};

ConfirmedReport.prototype.getFlattened = function(req, res) {
	var me = this;
};

ConfirmedReport.prototype.get = function(id, getCallback) {
	var me = this;

	me.models.confirmedReport.findById(id, function(err, confirmedReport) {
		if(err) {
			var errMsg = "Error in retrieving confirmed report";
			me.logger.error("confirmeedReport: " + errMsg, err);
		} 
		
		getCallback(err, confirmedReport);
	});
};

ConfirmedReport.prototype.flattenConfirmedReports = function(reports, callback) {
	var me = this;
};

ConfirmedReport.prototype.create = function(data, createCallback) {
	var me = this;

	//validateConfirmedReport(data, function(valid) {
	//	if (valid.valid) {
	//		logger.info("Valid AlphaReport");
			var newConfirmedReport = new me.models.confirmedReport(data);
			newConfirmedReport.save(function(err){
				if(err){
					me.logger.error('Error saving confirmedReport ', err);
				}
				createCallback(err,/* valid,*/ newConfirmedReport);
			});
	//	}
	//	else {
	//		saveCallback(undefined, valid, data);
	//	}
	//});
};

ConfirmedReport.prototype.update = function() {

};

ConfirmedReport.prototype.delete = function(paramsObject, deleteCallback) {
	var me = this;

	me.models.confirmedReport.remove(paramsObject, deleteCallback);
};