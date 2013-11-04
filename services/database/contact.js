module.exports = function(models, io, logger) {
	var me = this;

	me.list = function(config, callback) {
		//TODO paging
		me.models.contact.find({}, callback);
	};

	/* = function(res){
	models.contact.find({},'_id name', function(err, docs){
		if(err){
			logger.info("Error listing contacts "+err);
			general.send500(res);
		} else {
			res.json(docs);
		}
		res.end();
	});*/

	me.create = function(data, callback) {
		var newContact = new models.contact(data);
		newContact.save(function(err){
			if(err){
				logger.error('Error saving contact ', err);
			} 
			callback(err, newContact);
		});
	};
	/*
	this.createContact = function(data, res){
		var newContact = new models.contact(data);
		newContact.save(function(err){
			if(err){
				logger.error('Error saving contact',err);
				general.send500(res);
			} else {
				res.json({id:newContact._id});
				res.end();
			}
		});
	};
	*/

	me.get = function(id, callback) {
		me.models.find({_id: id}, callback);
	};

	/*
	this.getContact = function(id, res){
		models.contact.findById(id, function(err, docs){
			if(err) {
				logger.info("Error getting contact "+err);
				general.send500(res);
			} else if(docs) {
				res.json(docs);
			} else {
				general.send404(res);
			}
			res.end();
		});
	};
	*/

	me.update = function(id, data, callback) {
		models.contact.findById(id, function(err, docs){
			if(err) {
				logger.info("Error getting contact "+err);
				callback(err, docs);
			} else if(docs) {
				for(var e in data){
					//Make sure not to change _id
					if(e !== '_id'){
						docs[e] = data[e];
					}
				}
				docs.save(function(err){
					callback(err, docs);
				});
			} else {
				//callback hndle 404
				logger.debug("Contact not found");
			}
		});
	};
	/*
	this.updateContact = function(id, data, res){
		models.contact.findById(id, function(err, docs){
			if(err) {
				logger.info("Error getting contact "+err);
				general.send500(res);
			} else if(docs) {
				for(var e in data){
					//Make sure not to change _id
					if(e !== '_id'){
						docs[e] = data[e];
					}
				}
				docs.save(function(err){
					if(err){
						logger.error('Error updating contact',err);
						general.send500(res);
					}
					res.json({status:'ok'});
					res.end();
				});
			} else {
				general.send404(res);
			}
			res.end();
		});
	};
	*/

	me.del = function(config, callback) {
		models.contact.remove(config, callback);
	};

	/*
	this.deleteContact = function(id, res) {
		models.contact.find({_id:id}, function(err, docs){
			if(err || docs.length === 0){
				logger.error('Error deleting contact', err);
				general.send500(res);
			} else {
				for(var i = 0; i < docs.length; i++){
					docs[i].remove();
				}
				res.json({status:'ok'});
				res.end();
			}//;
		});
	};
	*/
};
