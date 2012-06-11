

this.load_mod = function(app){
	app.get('/dummy/?', function(req, res){
		res.json({dummies: ['0', '1', '2']});
	});
	
	app.get('/dummy/:id', function(req, res){
		res.json({id: req.params.id, message: 'Your a dummy'});
	});
};