/*global require */
// require is a global node function/keyword

var models = require('../models/models');

module.exports = function(app, io, logger){

	var AlphaReport = require('./rest/alpha_report.js');
	new AlphaReport(app, models, io, logger);

	var Assertion = require('./rest/assertion.js');
	new Assertion(app, models, io, logger);

	var AtomRss = require('./rest/atom_rss_ingest.js');
	new AtomRss(app, models, io, logger);

	var Comment = require('./rest/comment.js');
	new Comment(app, models, io, logger);

	var Event = require('./rest/event.js');
	new Event(app, models, io, logger);

	var Incident = require('./rest/incident.js');
	new Incident(app, models, io, logger);

	var NlpParser = require('./rest/nlp_parser_service.js');
	new NlpParser(app, models, io, logger);

	var Options = require('./rest/options.js');
	new Options(app, models, io, logger);

	var Place = require('./rest/place.js');
	new Place(app, models, io, logger);

	var Profile = require('./rest/profile.js');
	new Profile(app, models, io, logger);

	var RawFeed = require('./rest/raw_feed.js');
	new RawFeed(app, models, io, logger);

	var Report = require('./rest/report.js');
	new Report(app, models, io, logger);

	var Reporter = require('./rest/reporter.js');
	new Reporter(app, models, io, logger);

	var TargetAssertion = require('./rest/target_assertion.js');
	new TargetAssertion(app, models, io, logger);

	var TargetEvent = require('./rest/target_event.js');
	new TargetEvent(app, models, io, logger);
	
	var TitanGraph = require('./rest/titan_graph.js');
	new TitanGraph(app, models, io, logger);

	var TwitterIngest = require('./rest/twitter_ingest.js');
	new TwitterIngest(app, models, io, logger);

	var Patient = require('./rest/patient.js');
	new Patient(app, models, io, logger);

	var Reminder = require('./rest/reminder.js');
	new Reminder(app, models, io, logger);

	var ActionHandler = require('./action_handler.js');
	new ActionHandler(models, io, logger);

	app.get('/', function(req, res){
		res.redirect('/events');
	});
};