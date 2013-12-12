/*global require*/
// require is a node.js keyword, not a part of standard JavaScript

//alpha report
var alphaReportModel = require('./alpha_report/model.js');
exports.alphaReport = alphaReportModel.alphaReport;
exports.alphaReportValidation = alphaReportModel.alphaReportValidation;

//assertion
var assertionModel = require('./assertion/model.js');
exports.assertion = assertionModel.assertion;
exports.assertionValidation = assertionModel.assertionValidation;

//assertion
var atomRssModel = require('./atom_rss/model.js');
exports.atomRss = atomRssModel.atomRss;

//comment
var commentModel = require('./comment/model.js');
exports.comment = commentModel.comment;
exports.commentValidatoin = commentModel.commentValidatoin;

//event
var eventModel = require('./event/model.js');
exports.event_ = eventModel.event_;
exports.eventValidation = eventModel.eventValidation;

//incident
var incidentModel = require('./incident/model.js');
exports.incident = incidentModel.incident;
exports.incidentValidation = incidentModel.incidentValidation;

//place
var placeModel = require('./place/model.js');
exports.place = placeModel.place;
exports.placeValidation = placeModel.placeValidation;

//profile
var profileModel = require('./profile/model.js');
exports.profile = profileModel.profile;
exports.profileValidation = profileModel.profileValidation;

//raw feed
var rawFeedModel = require('./raw_feed/model.js');
exports.rawFeed = rawFeedModel.rawFeed;
exports.rawFeedValidation = rawFeedModel.rawFeedValidation;

//report
var reportModel = require('./report/model.js');
exports.report = reportModel.report;
exports.reportValidation = reportModel.reportValidation;

//reporter
var reporterModel = require('./reporter/model.js');
exports.reporter = reporterModel.reporter;
exports.reporterValidation = reporterModel.reporterValidation;

//target_assertion
var targetAssertionModel = require('./target_assertion/model.js');
exports.targetAssertion = targetAssertionModel.targetAssertion;
exports.targetAssertionValidation = targetAssertionModel.targetAssertionValidation;

//target_event
var targetEventModel = require('./target_event/model.js');
exports.targetEvent = targetEventModel.targetEvent;
exports.targetEventValidation = targetEventModel.targetEventValidation;

var twitterKeyModel = require('./twitter_key/model.js');
exports.twitterKey = twitterKeyModel.twitterKey;

var patientModel = require('./patient/model.js');
exports.patient = patientModel.patient;

var reminderModel = require('./reminder/model.js');
exports.reminder = reminderModel.reminder;