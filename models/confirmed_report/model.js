var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var ObjectId = Schema.ObjectId;

this.confirmedReportModel = {
	created_date: {type: Date},
	updated_date: {type: Date}
};


var ConfirmedReportSchema = new Schema(this.confirmedReportModel);
this.confirmedReport = mongoose.model('ConfirmedReport', ConfirmedReportSchema);


this.reporterValidation = {
	properties: {
		created_date: {
			description: 'Date this reporter was created in datastore',
			type: 'date'
		},
		updated_date: {
			description: 'Date this reporter was updated in datastore',
			type: 'date'
		}
	}
};