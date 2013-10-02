/**
 * Runs while connected to a database
 */

/*global require */
// require is a global node function/keyword

var general = require('../general_response');

/**
 * Returns a general options message
 */
this.getOptions = function(res){
	general.getOptions(res);
};