/*global require */
// require is a global node function/keyword

var models = require('../models/models');

var routerService = module.exports = function(app, io, logger){
	var AlphaReport = require('./rest/alpha_report.js');
	var alphaReport = new AlphaReport(app, models, io, logger);
	
	var Assertion = require('./rest/assertion.js');
	var asserion = new Assertion(app, models, io, logger);

	var Comment = require('./rest/comment.js');
	var comment = new Comment(app, models, io, logger);

	var ConfirmedReport = require('./rest/confirmed_report.js');
	var confirmedReport = new ConfirmedReport(app, models, io, logger);

	var Event = require('./rest/event.js');
	var event = new Event(app, models, io, logger);
	
	var Incident = require('./rest/incident.js');
	var incident = new Incident(app, models, io, logger);

	var Location = require('./rest/location.js');
	var location = new Location(app, models, io, logger);
	
	var NlpParser = require('./rest/nlp_parser_service.js');
	var nlpParser = new NlpParser(app, models, io, logger);
	
	var Options = require('./rest/options.js');
	var options = new Options(app, models, io, logger);
	
	var Profile = require('./rest/profile.js');
	var profile = new Profile(app, models, io, logger);
	
	var RawFeed = require('./rest/raw_feed.js');
	var rawFeed = new RawFeed(app, models, io, logger);

	var Reporter = require('./rest/reporter.js');
	var reporter = new Reporter(app, models, io, logger);
	
	var TargetAssertion = require('./rest/target_assertion.js');
	var targetAssertion = new TargetAssertion(app, models, io, logger);
	
	var TwitterIngest = require('./rest/twitter_ingest_service.js');
	var twitterIngest = new TwitterIngest(app, models, io, logger);
	
	app.get('/', function(req, res){
		res.redirect('/events');
	});
};