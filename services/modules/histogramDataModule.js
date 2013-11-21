var async = require('async');

module.exports = function(model) {
	this.findDatesByFrequency = function(mode, basedate, query, callback){
	//Get the base year, month, day, hour, minute for comparision.	
	var tempBasedate = new Date(parseInt(basedate)).getFullYear();
	var tempBasedateMonth= new Date(parseInt(basedate)).getMonth();
	var tempBasedateDay= new Date(parseInt(basedate)).getDate();
	var tempBasedateHour= new Date(parseInt(basedate)).getUTCHours();
	var tempBasedateMinute= new Date(parseInt(basedate)).getUTCMinutes();
	model.find({},{_id: 0, createdDate: 1}, function(err, dates) {
		var errorMsg = new Error("Could not get feed Dates: " + err);
		if(err) {
			callback(errorMsg);
		} else {
			async.map(dates, flattenArray, function(err,results) {
				if(err) {
					callback(errorMsg);
				} else {
			    	var reduceResults = results.reduce(function(acc,curr) {
			    		var tempDate = new Date(parseInt(curr));
			    		var yearMatch = tempBasedate === tempDate.getFullYear();
			    		var monthMatch = tempBasedateMonth === tempDate.getMonth();
			    		var dayMatch = tempBasedateDay === tempDate.getDate();
			    		var hourMatch = tempBasedateHour === tempDate.getUTCHours();
			    		var minuteMatch = tempBasedateMinute === tempDate.getUTCMinutes();
		    			switch(mode) {
		    				case "year": 
		    					curr = new Date(parseInt(curr)).getFullYear();
		    					return countDatesGivenRange(acc,curr);
		    				case "month": 
		    					if(yearMatch) {
		    						curr = new Date(parseInt(curr)).getMonth();
		    						return countDatesGivenRange(acc,curr);
	    						}
		    				case "day": 
		    					if(yearMatch && monthMatch) {
		    						curr = new Date(parseInt(curr)).getDate();
		    						return countDatesGivenRange(acc,curr);
		    					}
		    				case "hour": 
		    					if(yearMatch && monthMatch && dayMatch) {
		    						curr = new Date(parseInt(curr)).getUTCHours();
		    						return countDatesGivenRange(acc,curr);
		    					}
		    				case "minute": 
		    					if(yearMatch && monthMatch && dayMatch && hourMatch) {
		    						curr = new Date(parseInt(curr)).getUTCMinutes();
		    						return countDatesGivenRange(acc,curr);
		    					}
	    					case "second": 
	    						if(yearMatch && monthMatch && dayMatch && hourMatch && minuteMatch){
		    						curr = new Date(parseInt(curr)).getUTCSeconds();
		    						return countDatesGivenRange(acc,curr);
		    					} 
	    					default:
	    						return acc;
		    			}
			    	},{});
			    	pushToOutputArrayCallback(reduceResults);
				}
			});
		}
	});
	
	var getBaseDates = function(date) {
		return {'baseYear': new Date(parseInt(date)).getUTCFullYear(), 'baseMonth': new Date(parseInt(date)).getUTCMonth(),
		'baseDay': new Date(parseInt(date)).getUTCDate(), 'baseHour': new Date(parseInt(date)).getUTCHours(),
		'baseMinute': new Date(parseInt(date)).getUTCMinutes(), 'baseSecond': new Date(parseInt(date)).getUTCSeconds()};
	};


	var pushToOutputArrayCallback = function(object) {
    	var outputArray = [];
    	var baseDateObject = getBaseDates(basedate);
		for(var i in object) {
			var tempObject = {date: parseInt(i), frequency: object[i]};
			for(i in baseDateObject) {
				tempObject[i] = baseDateObject[i];
			}
			outputArray.push(tempObject);
		}
		callback(outputArray);
	};

	var countDatesGivenRange = function(acc, curr) {
		if(typeof acc[curr] == 'undefined') {
			acc[curr] = 1; 
		} else {
			acc[curr] += 1;
		}
		return acc;
	};
};
	var flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};
};