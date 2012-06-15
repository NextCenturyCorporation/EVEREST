

this.load_mod = function(app){
	app.get('/dummy/?', function(req, res){
		res.json({dummies: ['0', '1', '2']});
	});
	
	app.get('/dummy/:id', function(req, res){
		res.json([

		          {
		              GID: 0,
		              _id: "4fda1d7303ca976815000002",
		              contact: "4fd8c807b55dece408000002",
		              description: "Aah! Hes here!",
		              location: "4fd8c807b55dece408000003",
		              radius: 10,
		              status: "Ongoing",
		              title: "Edgardo!",
		              type: "Emergency",
		              timestmp: "2012-06-14T17:20:51.169Z"
		          }

		      ]);
		res.end();
		});
};