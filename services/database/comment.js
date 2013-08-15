/*global require */
// require is a global node function/keyword

var general = require('../wizard_service');

var CommentService = module.exports = function(models, log) {
	var me = this;

	me.models = models;
	me.logger = log;
};

CommentService.prototype.listComments = function(opts, res){
	var me = this;

	var count = 10;

	//TODO params
	me.models.event.find({}, 'comments', {sort: {timestamp: -1}}, function(err, docs){
		if(err){
			me.logger.error('Error getting comments',err);
			res.status(500);
			res.json({status: "Error"});
		} else if(docs.length > 0){
			//Comments are sorted newest first
			if(opts.after){
				//They are requesting only comments after a certain ID, so
				//send all the comments until you hit that ID or you hit $count
				//comments processed
				var comments = [];
				var i = 0;
				var length;

				if(count !== undefined && count < docs[0].comments.length){
					length = count;
				} else {
					length = comments.length;
				}

				while(i < length && docs[0].comments[i]._id !== opts.after){
					comments.push(docs[0].comments[i]);
					i++;
				}
				res.json(comments);
			} else {
				//Just return the last $count comments
				res.json(docs[0].comments);
			}
			res.end();			
		} else {
			general.send404(res);
		}//;
	});
};

/**
 * Adds a comment to the event with the id in the URL.
 * On success, it returns status:'Success', and it emits a
 * Socket.io message with the id of the event.
 */
CommentService.prototype.addComment = function(id, req, res, io){
	var me = this;

	me.models.event.find({_id:id}, 'comments GID', {sort: {timestamp: 1}}, function(err,docs){
		if(err || docs.length === 0){
			me.logger.error('Error adding comment',err);
			general.send500(res);
		} else {
			var newComment = new me.models.comment(req);
			docs[0].comments.push(newComment);
			docs[0].comments.sort(function(a,b){
				if(a.timestmp > b.timestmp){
					return -1;
				} else if(a.timestmp < b.timestmp){
					return 1;
				} else {
					return 0;
				}
			});
			docs[0].save(function(err){
				if(err){
					general.send500(res,err);
				} else {
					res.json({status: 'OK'});
					res.end();
					io.sockets.emit('comment', {'id':docs[0]._id});
				}
			});
		}//;
	});
};
