var config = {};

//Port to listen on
config.port = process.env.port || 8081;
//Database address
config.db_host = process.env.db_host || '10.10.20.12';
//Database port
config.db_port = process.env.db_port || 27017;
//Collection name
config.db_collection = process.env.collection || 'centurion';

//Option to disable the database entirely, and run from memory
config.noDB = process.env.disableDB || false;

module.exports = config;