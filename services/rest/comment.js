/*global require*/
// Identify require as a global function/keyword for JSHint

var CommentService = require('../database/comment.js');
var responseHandler = require('../wizard_service');

var commentRoutes = module.exports = function(app, models, io, log) {
	var me = this;

	me.app = app;
	me.models = models;
	me.io = io;
	me.logger = log;

	var commentService = new CommentService(models, log);

	/*
	//TODO commented because handlers not yet implemented


	me.app.get('/comment/?',function(req,res){
		if(me.logger.DO_LOG){
			me.logger.info("Request for list of comments");
		}

		//commentService.getComments(req.query, res);
	});
	
	//Add a comment
	me.app.post('/comment/', function(req,res){
		//commentService.addComment(req.params.id, req.body, res, io);
	});*/
};