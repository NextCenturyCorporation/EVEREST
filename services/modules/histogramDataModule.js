var async = require('async');
var moment = require('moment');

module.exports = function(model) {
	this.findDatesByFrequency = function(data, callback){
		var dateRange = [];
		if(data.dates) {
			async.forEach(data.dates, function(date, cb) {
				getCountFromDate(model, date, dateRange, cb);
			}, function() {
				callback(dateRange.sort(function(a, b) {return new Date(a.date) - new Date(b.date);}));
			});
		};
	};

	var getCountFromDate = function(model, date, dateArr, cb) {
		var baseDate;
		var mode = date.mode.toLowerCase();
		var bucketDate = moment(date.bucketDate).utc();
		var startRange =moment(date.bucketDate).utc().startOf(mode);
		var endRange =moment(date.bucketDate).utc().endOf(mode);
		if(mode === 'year') {
			baseDate = bucketDate.format('YYYY');
		} else if(mode === 'month') {
			baseDate = bucketDate.format('YYYY-MM');
		} else if(mode === 'day') {
			baseDate = bucketDate.format('YYYY-MM-DD');
		} else if(mode === 'hour') {
			baseDate = bucketDate.format('YYYY-MM-DD HH:mm');
		}
		var config = { createdDate: { $gte: startRange, $lte: endRange } };
		model.count(config, function(err, count) {
			dateArr.push({ mode: date.mode, date: baseDate, frequency: count, startRange: startRange, endRange: endRange });
			cb();
		});
	};
};