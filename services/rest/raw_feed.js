var rawFeedService = require('../database/raw_feed.js');

this.load = function(app, io, gcm, logger) {
	app.get('/rawfeed/?', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for list of events');
		}
		rawFeedService.list(req.query, res);
	});
}