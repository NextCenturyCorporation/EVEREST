/*global require */
// require is a global node function/keyword

var models = require('../models/models');

module.exports = function(app, io, logger){
	var AlphaReport = require('./rest/alpha_report.js');
	new AlphaReport(app, models, io, logger);
	
	var Assertion = require('./rest/assertion.js');
	new Assertion(app, models, io, logger);

	var Comment = require('./rest/comment.js');
	new Comment(app, models, io, logger);

	var ConfirmedReport = require('./rest/confirmed_report.js');
	new ConfirmedReport(app, models, io, logger);

	var Event = require('./rest/event.js');
	new Event(app, models, io, logger);
	
	var Incident = require('./rest/incident.js');
	new Incident(app, models, io, logger);

	var Location = require('./rest/location.js');
	new Location(app, models, io, logger);
	
	var NlpParser = require('./rest/nlp_parser_service.js');
	new NlpParser(app, models, io, logger);
	
	var Options = require('./rest/options.js');
	new Options(app, models, io, logger);
	
	var Profile = require('./rest/profile.js');
	new Profile(app, models, io, logger);
	
	var RawFeed = require('./rest/raw_feed.js');
	new RawFeed(app, models, io, logger);

	var Reporter = require('./rest/reporter.js');
	new Reporter(app, models, io, logger);
	
	var TargetAssertion = require('./rest/target_assertion.js');
	new TargetAssertion(app, models, io, logger);
	
	var TwitterIngest = require('./rest/twitter_ingest.js');
	new TwitterIngest(app, models, io, logger);
	
	app.get('/', function(req, res){
		res.redirect('/events');
	});
};