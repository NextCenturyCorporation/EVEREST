var async = require('async');

var AlphaReportService = require('./alpha_report');
var ProfileService = require('./profile');
//var TargetEventService = require('./target_event');

var ConfirmedReport = module.exports = function(models, io, log) {
	var me = this;

	me.logger = log;
	me.models = models;
	me.io = io;
};

ConfirmedReport.prototype.listFlattened = function(params, listFlatCallback) {
	var me = this;

	me.list(params, function(err, reports) {
		//FIXME handle err;
		//handle none;
		async.each(reports, function(report, callback) {
			me.flattenConfirmedReport(report, function(err, updatedReport) {
				if(!err) {
					report = updatedReport;
				}
				callback(err);
			});
		}, function(err) {
			listFlatCallback(err, reports);
		});
	});
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

ConfirmedReport.prototype.getFlattened = function(id, callback) {
	var me = this;

	me.get(id, function(err, report) {
		//FIXME handle err
		me.flattenConfirmedReport(report, callback);
	});
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

ConfirmedReport.prototype.flattenConfirmedReport = function(report, callback) {
	var me = this;

	var fieldsToFlatten = ['alpha_report_id'/*, 'target_event_id',*/ 'profile_id', 'assertions'];

	async.each(fieldsToFlatten, function(field, fieldCallback) {
		if(field === 'assertions' && report.assertions.length > 0) {
			var flattenedAssertions = [];
			async.each(report.assertions, function(assertion, assertionCallback) {
				me.flattenField(report, assertion, function(err, flattenedField) {
					if(err) {
						assertionCallback(err);
					} else {
						flattenedAssertions.put(flattenedField);
						assertionCallback();
					}
				});
			}, function(err) {
				report.assertions = flattenedAssertions;
				fieldCallback(err);
			});
		} else {
			if(typeof(report[field]) !== 'undefined' && report[field] !== null) {
				me.flattenField(report, field, function(err, flattenedField) {
					if(err) {
						fieldCallback(err);
					} else {
						report[field] = flattenedField;
						fieldCallback();
					}
				});
			}
		}
	},function(err) {
		callback(err, report);
	});
};

ConfirmedReport.prototype.flattenField = function(report, field, callback) {
	var me = this;

	if(field === 'alpha_report_id') {
		var alphaReportService = new AlphaReportService(me.models, me.io, me.logger);

		alphaReportService.get(report.alpha_report_id, callback);
	} else if(field === 'target_event_id') {
		
	} else if(field === 'profile_id') {
		var profileService = new ProfileService(me.models, me.io, me.logger);
		profileService.get(report.profile_id, callback);
	}
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

ConfirmedReport.prototype.update = function(id, data, updateCallback) {
	var me = this;

	me.get(id, function(err, confirmedReport) {
		if(err) {
			me.logger.error("Error getting confirmed report for updating;", err);
			updateCallback(err, null);
		} else if(typeof(confirmedReport) === 'undefined' || !confirmedReport) {
			me.logger.error("Could not find a confirmed report for updating with id " + id, err);
			updateCallback(err, null);
		} else {
			async.each(Object.keys(data), function(key, eachCallback) {
				confirmedReport[key] = data[key];
				eachCallback();
			}, function(err) {
				//validate
				confirmedReport.save(function(err) {
					updateCallback(err, confirmedReport);
				});
			});
		}
	});
};

ConfirmedReport.prototype.del = function(paramsObject, deleteCallback) {
	var me = this;

	me.models.confirmedReport.remove(paramsObject, deleteCallback);
};