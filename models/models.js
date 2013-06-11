/**
 * Set up database connection to use
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config.js');

//raw feed
var rawFeedModel = require('./raw_feed/model.js');
this.rawFeed = rawFeedModel.rawFeed;

//location
var locationModel = require('./location/model.js');
this.location = locationModel.location;

//comment
var commentModel = require('./comment/model.js');
this.comment = commentModel.comment;

