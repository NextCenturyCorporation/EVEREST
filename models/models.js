/*global require*/
// require is a node.js keyword, not a part of standard JavaScript

//location
var locationModel = require('./location/model.js');
exports.location = locationModel.location;

//comment
var commentModel = require('./comment/model.js');
exports.comment = commentModel.comment;

//raw feed
var rawFeedModel = require('./raw_feed/model.js');
exports.rawFeed.model = rawFeedModel.rawFeed;
exports.rawFeed.validation = rawFeedModel.rawFeedValidation;

//alpha report
var alphaReportModel = require('./alpha_report/model.js');
exports.alphaReport = alphaReportModel.alphaReport;

//assertion
var assertionModel = require('./assertion/model.js');
exports.assertion = assertionModel.assertion;

//confirmed report
var confirmedReportModel = require('./confirmed_report/model.js');
exports.confirmedReport = confirmedReportModel.confirmedReport;

//event
var eventModel = require('./event/model.js');
exports.event = eventModel.event;

//incident
var incidentModel = require('./incident/model.js');
exports.incident = incidentModel.incident;

//profile
var profileModel = require('./profile/model.js');
exports.profile = profileModel.profile;

//reporter
var reporterModel = require('./reporter/model.js');
exports.reporter = reporterModel.reporter;

//target_assertion
var targetAssertionModel = require('./target_assertion/model.js');
exports.targetAssertion = targetAssertionModel.targetAssertion;
