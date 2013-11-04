var optionsService = require('../database/options.js');

module.exports = function(app, modules, io, logger) {
	
	//Get all options for server
	app.get('/options',function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for all options");
		}
		optionsService.getOptions(res);
	});
};