var config = require('../config');

//This function is used to handle URL paramaters (i.e. /scorecard?count=100)
//This is extensible by just adding the url parameter that you want to implement 
//on the given passed request url below.
var handleDefaultParams = function (incomingParams, handleCallback) {
	var queryData = (incomingParams ? incomingParams : {});
	var params = {
		count : config.paramDefaults.listCount,
		offset : config.paramDefaults.listOffset,
		sort : config.paramDefaults.listSort,
		sortKey: config.paramDefaults.listSortKey,
		start: config.paramDefaults.listStart,
		end: config.paramDefaults.listEnd
	};
  
	if(queryData.count) {
		params.count = queryData.count;
	}
	if(queryData.offset  && queryData.offset > 0) {
		params.offset = queryData.offset;
	}
	if(queryData.sort) {
		params.sort = ((queryData.sort === 'desc') ? -1 : 1); 
	}
	if(queryData.sortKey) {
		params.sortKey = queryData.sortKey;
	}
	if(queryData.start) {
		var d = new Date(queryData.start);
		if (d){		
			params.start = d;
		}
	}
	if(queryData.end){
		var d = new Date(queryData.end);
		if (d && d > params.start){
			params.end = d;
		}
	}
	handleCallback(params);
};	

exports.handleDefaultParams = handleDefaultParams;