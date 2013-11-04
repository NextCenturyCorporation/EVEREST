var TitanGraphService = require('../database/titan_graph.js');
var responseHandler = require('../general_response');

module.exports = function(app, models, io, logger) {
        var me = this;

        me.logger = logger;
        me.models = models;
        me.app = app;
        me.io = io;

        var titanGraphService = new TitanGraphService(models, io, logger);
        
        app.get('/titan-graph/:id([0-9]+)', function(req, res){
                if(logger.DO_LOG){
                        logger.info('Request for graphs');
                }
                titanGraphService.getPath(req.params.id, function(err, docs){
                        res.jsonp(docs);
                        res.end();
                });
        });
        
        app.get('/titan-graph/vertices/?', function(req, res){
                if(logger.DO_LOG){
                        logger.info('Request for graphs');
                }
                titanGraphService.listVertices(req.query, function(err, docs){
                        res.jsonp(docs);
                        res.end();
                });
        });

        app.get('/titan-graph/edges/?', function(req, res){
                if(logger.DO_LOG){
                        logger.info('Request for graphs');
                }
                titanGraphService.listEdges(req.query, function(err, docs){
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
                        if(err){
                                logger.error('Error saving TitanGraph', err);
                                responseHandler.send500(res, 'Error saving TitanGraph');
                        } else {
                                logger.info('TitanGraph saved ' + JSON.stringify(newTitanGraph));
                                res.jsonp(newTitanGraph);
                                res.end();
                        }
                });
        });
};