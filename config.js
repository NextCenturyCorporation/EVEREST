var config = {};

//Port to listen on
config.port = process.env.PORT || 8081;
//Database address
config.db_host = process.env.DB_HOST || '127.0.0.1';
//Database port
config.db_port = process.env.DB_PORT || 27017;
//Collection name
config.db_collection = process.env.DB_COLLECTION || 'everest';

config.log_level = process.env.LOG_LEVEL || 'debug';

config.defaultTwitterKey = {
	consumer_key: 'rwJPisTyYT2zzi0o4hpv2g',
	consumer_secret: 'ncTw7IKtmCFwNyhQ8OOfshfGOOCPLPlDug0Em1oIg',
	access_token_key: '53703582-dF6S7rtSzCBQtxbQnSkjy49ECSPMix7tXz2O8W0ej',
	access_token_secret: 'G74GzFILLGmrjDV9cJSGQb6cRC4yk2sP5dD7lL8x2z0'
};

config.paramDefaults = {
	listCount: null,
	listOffset: 0,
	listSort: 1,
	listSortKey: "_id",
	listStart: new Date(0),
	listEnd: new Date('01/01/3000')
};

module.exports = config;