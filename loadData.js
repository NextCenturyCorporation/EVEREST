/**
 * Simple node app to load the basic data into the database specified
 */

// Load and override the config file
var config = require('./config.js');
config.noDB = 0;

// Check that argument 2 is confirm
// (Argument 0=node 1=this file)
if(process.argv[2] !== 'confirm'){
	console.log('This will connect to the MongoDB  specified in config.js, or by the enviornment variables.');
	console.log('The current configuration is:');
	console.log('Host: '+config.db_host+' (Overridable by setting db_host)');
	console.log('Port: '+config.db_port+' (Overridable by setting db_port)');
	console.log('Collection: '+config.db_collection+' (Overridable by setting collection)');
	console.log('Please note: It is preferred to change your settings by editing the config.js file'+
			' rather than enviornment variables, to prevent errors');
	console.log('Run this script one more time with the argument \'confirm\' to write data to the database.');
} else {
	console.log('Writing data to:');
	console.log('Host: '+config.db_host);
	console.log('Port: '+config.db_port);
	console.log('Collection: '+config.db_collection);
	var tmp = require('./events/loadinitial.js').load();
	console.log('Success');
	process.exit(0);
}
