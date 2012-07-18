

this.load = function(app){
	app.get('/dummy/?', function(req, res){
		res.json({dummies: ['0', '1', '2']});
	});
	
	app.get('/dummy/:id', function(req, res){
		res.json([
		          {
		              "GID": 0,
		              "_id": "4fda1d7303ca976815000002",
		              "contact": {
		                  "phone": "410-000-0000",
		                  "email": "george@com.com",
		                  "name": "George",
		                  "_id": "4fd8c807b55dece408000002"
		              },
		              "description": "Aah! Hes here!",
		              "group": 0,
		              "location": {
		                  "longitude": -76.809801,
		                  "latitude": 39.168051,
		                  "radius": 50,
		                  "name": "Building A",
		                  "_id": "4fd8c807b55dece408000003"
		              },
		              "radius": 10,
		              "status": "Ongoing",
		              "title": "Edgardo!",
		              "type": "Emergency",
		              "comments": [ ],
		              "timestmp": "2012-06-14T17:20:51.169Z",
		              "numComments": 8
		          }
		      ]);
		res.end();
		});
};