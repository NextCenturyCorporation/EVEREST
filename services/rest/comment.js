var commentService = require('../database/comment.js');

this.load = function(app, io, gcm, logger) {
	//get a specific comment
	app.get('/comment/:id([0-9a-f]+)',function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for comments of "+req.params.id);
		}
		commentService.getComments(req.params.id, req.query, res);
	});
	
	//Add a comment
	app.post('/comment/', function(req,res){
		commentService.addComment(req.params.id, req.body, res, io);
	});
};