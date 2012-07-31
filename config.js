var config = {};

//Port to listen on
config.port = process.env.PORT || 8081;
//Database address
config.db_host = process.env.DB_HOST || '10.10.20.12';
//Database port
config.db_port = process.env.DB_PORT || 27017;
//Collection name
config.db_collection = process.env.DB_COLLECTION || 'centurion';

//Option to disable the database entirely, and run from memory
config.noDB = process.env.DB_DISABLE || false;

//Option to not load default data in no-database mode
config.noData = process.env.NODATA || false;

config.eventTypes = ['Emergency', 'Warning', 'Weather', 'Traffic', 'Information'];

module.exports = config;