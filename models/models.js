/*global require*/
// require is a node.js keyword, not a part of standard JavaScript

//location
var locationModel = require('./location/model.js');
this.location = locationModel.location;

//comment
var commentModel = require('./comment/model.js');
this.comment = commentModel.comment;

//raw feed
var rawFeedModel = require('./raw_feed/model.js');
this.rawFeed = rawFeedModel.rawFeed;

//alpha report
var alphaReportModel = require('./alpha_report/model.js');
this.alphaReport = alphaReportModel.alphaReport;

//assertion
var assertionModel = require('./assertion/model.js');
this.assertion = assertionModel.assertion;

//confirmed report
var confirmedReportModel = require('./confirmed_report/model.js');
this.confirmedReport = confirmedReportModel.confirmedReport;

//event
var eventModel = require('./event/model.js');
this.event = eventModel.event;

//incident
var incidentModel = require('./incident/model.js');
this.incident = incidentModel.incident;

//user
var userModel = require('./user/model.js');
this.user = userModel.user;

//reporter
var reporterModel = require('./reporter/model.js');
this.reporter = reporterModel.reporter;