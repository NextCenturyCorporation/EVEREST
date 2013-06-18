/**
 * Runs while connected to a database
 */
var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

this.listFeeds = function(opts, res){

};

this.createFeed = function(data, res, io, gcm){

};

this.getFeed = function(index, opts, res){

};

this.updateFeed = function(index, data, res){

};

this.deleteFeed = function(index, res){

};
