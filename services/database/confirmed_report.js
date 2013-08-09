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
			var errMsg = "Error attempting to list confirmed reports";
			me.logger.error("confirmedReport: " + errMsg, err);
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
			var errMsg = "Error in retrieving list of confirmed reports";
			me.logger.error("confirmeedReport: " + errMsg, err);
		} 
		
		listCallback(err, confirmedReports);
	});
};

ConfirmedReport.prototype.getRequest = function(id, res) {
	var me = this;

	me.get(id, function(err, report) {
		if(err) {
			var errMsg = "Error attempting to get confirmed report";
			me.logger.error("confirmedReport: " + errMsg, err);
			responseHandler.send500(res, errMsg);
		} else {
			res.json(report);
			res.end();
		}
	});
};

ConfirmedReport.prototype.getFlattenedRequest = function(req, res) {
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

ConfirmedReport.prototype.createRequest = function(data, res) {
	var me = this;

	if(data.assertions) {
		data.assertions = data.assertions.split(',');
	}

	me.create(data, function(err, newConfirmedReport) {
		if(err) {
			var errMsg = "Error attempting to create confirmed report";
			me.logger.error("confirmedReport: " + errMsg, err);
			responseHandler.send500(res, errMsg);
		} else {
			res.json({_id: newConfirmedReport._id});
			res.end();
		}
	});
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

ConfirmedReport.prototype.updateRequest = function() {

};

ConfirmedReport.prototype.update = function() {

};

ConfirmedReport.prototype.deleteRequest = function(id, res) {
	var me = this;

	me.delete({_id: id}, function(err, count) {
		if(err) {
			var errMsg = "Error attempting to delete confirmed report";
			me.logger.error("confirmedReport: " + errMsg, err);
			responseHandler.send500(res, errMsg);
		} else {
			res.json({deleted_count: count, _id: id});
			res.end();
		}
	});
};

ConfirmedReport.prototype.deleteAllRequest = function(req, res) {
	var me = this;
	me.delete({}, function(err, count) {
		if(err) {

		} else {
			res.json({deleted_count: count});
			res.end();
		}
	});
};

ConfirmedReport.prototype.delete = function(paramsObject, deleteCallback) {
	var me = this;

	me.models.confirmedReport.remove(paramsObject, deleteCallback);
};