/**
 * Model for an event
 */

/**
 * Set up database connection to use
 */
var mysql = require('mysql');
/**
 * We can either explicitly connect with connection.connect(), or running a query will implicitly connect
 */
var connection = mysql.createConnection({
	host:'localhost',
	user: 'centurion',
	password: 'password',
	database: 'centurion'
	});

connection.connect(function(err){
	if(err)
		console.log("Error connectiong: "+err);
});

function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}


//Auto-reconnect
connection.on('close', function(err){
	if(err){
		console.log("DB connection closed, reopening "+err);
		connection = mysql.createConnection(connection.config);
	} else {
		//Expected it to close
	}
});

this.listEvents = function(res){
	connection.query('Select id from events', function(err, rows){
		if(err){
			console.log("Error: "+err);
			res.send('Error');
			res.end();
		} else {
			res.json({events: rows});
			res.end();
		}
	});
};

this.getEvent = function(index, res){
	connection.query('select * from events where id = '+connection.escape(index), function(err, rows){
		if(err){
			console.log("Error fetching event "+err);
			res.send('Error');
			res.end();
		} else {
			console.log(rows[0]);
			res.json(rows[0]);
			res.end();
		}
	});
};

this.createEvent = function(title, message, location){
	connection.query("insert into events (title, description, location) values ("+
			connection.escape(title)+", "+connection.escape(message)+", "+connection.escape(location)+");", function(err, rows){
		if(err){
			console.log("Error inserting event: "+err);
		}
	});
};

this.deleteEvent = function(id){
	connection.query('delete from events where id = '+connection.escape(id), function(err, rows){
		if(err){
			console.log("Error deleting event: "+err);
		}
	});
};