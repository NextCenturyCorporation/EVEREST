var url = require('url');

/**
 * This function is used to handle URL parameters (i.e. /scorecard?count=100)
 * This is extensible by just adding the url parameter that you want to implement
 * on the given passed request url below.
**/
var handle = function (req, handleCallback) {
	var params = {};
	if(req && req.url) {
		
		var queryData = url.parse(req.url,true).query;
		
		if(queryData.count) {
			params.count = queryData.count;
		} else {
			params.count = 0;
		}
		
		if(queryData.offset) {
			params.offset = queryData.offset;
		} else {
			params.offset = 0;
		}
		
		if(queryData.sort) {
			params.sort = ((queryData.sort == 'desc') ? -1 : 1); 
		} else {
			params.sort = 1;
		}
	}
	handleCallback(params);
};	

exports.handle = handle;
