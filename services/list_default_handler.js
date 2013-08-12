var config = require('../lib/config');

var params = {
	count : config.paramDefaults.listCount,
	offset : config.paramDefaults.listOffset,
	sort : config.paramDefaults.listSort
};

//This function is used to handle URL paramaters (i.e. /scorecard?count=100)
//This is extensible by just adding the url parameter that you want to implement 
//on the given passed request url below.
var handleDefaultParams = function (incomingParams, handleCallback) {
	var params = {};
	var queryData = incomingParams;
		
	if(queryData.count) {
		params.count = queryData.count;
	} else {
		params.count = null;
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
	
	handleCallback(params);
};	

exports.handle = handle;

};	

exports.handleDefaultParams = handleDefaultParams;