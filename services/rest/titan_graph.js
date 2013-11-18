var TitanGraphService = require('../database/titan_graph.js');
var responseHandler = require('../general_response');

module.exports = function(app, models, io, logger) {
    var me = this;

    me.logger = logger;
    me.models = models;
    me.app = app;
    me.io = io;

    var titanGraphService = new TitanGraphService(models, io, logger);
    
    app.get('/titan-graph/?', function(req, res){
		if(logger.DO_LOG){
                logger.info('Request for graphs');
        }
        
        titanGraphService.list(req.query, function(err, docs){
            res.jsonp(docs);
            res.end();
        });
    });
    
    app.get('/titan-graph/:id([0-9]+)', function(req, res){
        if(logger.DO_LOG){
            logger.info('Request for graph by id');
        }
        
        titanGraphService.getPath(req.params.id, function(err, docs){
       		if (err) {
       			logger.error('Error getting vertex by id', err);
                responseHandler.send500(res, 'Error getting vertex');
       		} else {
	            res.jsonp(docs);
	            res.end();
	        }
        });
    });
    
    app.get('/titan-graph/vertices/?', function(req, res){
        if(logger.DO_LOG){
            logger.info('Request for vertices');
        }
        titanGraphService.listVertices(req.query, function(err, docs){
            res.jsonp(docs);
            res.end();
        });
    });
    
    app.get('/titan-graph/compare/:id([0-9]+)', function(req, res){
        if(logger.DO_LOG){
            logger.info('Request for comparison between two graphs');
        }
        
        titanGraphService.compare(req.params.id, function(err, docs){
            res.jsonp(docs);
            res.end();
        });
    });
    
    app.post('/titan-graph/?', function(req, res){
        if(logger.DO_LOG){
            logger.info('Receiving new titan graph', req.body);
        }
        
        titanGraphService.create(req.body, function(err, newTitanGraph) {
            if (err) {
                logger.error('Error saving TitanGraph', err);
                responseHandler.send500(res, 'Error saving TitanGraph');
            } else {
                logger.info('TitanGraph saved ' + JSON.stringify(newTitanGraph));
                res.jsonp(newTitanGraph);
                res.end();
            }
        });
    });
    
    app.post('/titan-graph/vertices/?', function(req, res){
        if(logger.DO_LOG){
            logger.info('Receiving new titan vertex', req.body);
        }
        
        titanGraphService.addVertex(req.body, 'mongo_assert_id', function(err, newVertex) {
            if (err) {
                logger.error('Error saving vertex', err);
                responseHandler.send500(res, 'Error saving vertex');
            } else {
                logger.info('Vertex saved ' + JSON.stringify(newVertex));
                res.jsonp(newVertex);
                res.end();
            }
        });
    });
    
    app.post('/titan-graph/edges/?', function(req, res){
        if (logger.DO_LOG) {
            logger.info('Receiving new titan edge', req.body);
        }
        
        titanGraphService.addEdge(req.body, 'mongo_assert_id', function(err, newEdge) {
            if (err) {
                logger.error('Error saving Edge', err);
                responseHandler.send500(res, 'Error saving Edge');
            } else {
                logger.info('Edge saved ' + JSON.stringify(newEdge));
                res.jsonp(newEdge);
                res.end();
            }
        });
    });
    
    app.del('/titan-graph/:id([0-9]+)', function(req, res){
        if(logger.DO_LOG){
            logger.info('Request for removal of titan graph with id '+ req.params.id);
        }
        
        titanGraphService.del(req.params.id, function(err, docs) {
        	if (err) {
        		logger.error('Error deleting graph with id ' + req.params.id);
                responseHandler.send500(res, 'Error deleting graph');
        	} else {
	            res.jsonp(docs);
	            res.end();
	        }
        });
    });
    
    app.del('/titan-graph/', function(req, res){
        if(logger.DO_LOG){
            logger.info('Request for removal of titan graph with id '+ req.params.id);
        }
        
        titanGraphService.deleteAll(function(err, docs) {
        	if (err) {
        		logger.error('Error deleting all graphs');
                responseHandler.send500(res, 'Error deleting graphs');
        	} else {
	            res.jsonp(docs);
	            res.end();
	        }
        });
    });
};