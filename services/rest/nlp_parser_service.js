var AlphaReportService = require('../database/alpha_report.js');
var Nlp_Parser = require('../parsers/nlp_parser_async.js');
var general = require('../general_response');

var async = require('async');

module.exports = function(app, models, io, logger){
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;

	var alphaReportService = new AlphaReportService(models, io, logger);

	//var services = {assertion: new AssertionService(models, io, logger)};
	var nlp_parser = new Nlp_Parser(models, io, logger);
	
	// start the parser
	app.get('/nlp-parser/parse', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser start.');
		}
		
		me.parse_reports(req.query, res);
	});

	me.parse_reports = function(){
		alphaReportService.readAlphaReports(function(err,docs){
			if(err) {
				logger.info({error: "Error getting all alpha reports "+err});
			} else if(0 !== docs.length) {
				for (var i = 0; i < docs.length; i++){
					nlp_parser.parseAndSave(docs[i]);
				}
			} else {
				logger.info({error: "Not found"});
			}
		});
	};
	
	// post text to get back tuples
	app.post('/nlp-parser/parse/?', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to parse text.');
		}
		
		nlp_parser.parseToTuples(req.body.text, function(err, tuples) {
			var results = [];
			var tuple;

			var size = tuples.sizeSync();
			for(var i = 0; i < size; i++) {
				tuple = tuples.getSync(i);
				results.push({
					sentence: req.body.text,
					entity1: tuple.getEntity1StringSync(),
					relationship: tuple.getRelationStringSync(),
					entity2: tuple.getEntity2StringSync()
				});
			}

			if (tuples) {
				res.json(results);
			}
			res.end();
		});
	});

	//pos tag sentences
	app.post('/nlp-parser/postagger/?', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to pos tag text.');
		}
		
		nlp_parser.posTagSentences(req.body.text, function(err, result) {
			if(err) {
				var msg = "There was an error attempting to tag the sentence";
				logger.error(msg);
				return general.send500(res, msg);
			}
			res.json(result);
			res.end();
		});
	});

	//annotation graph
	app.post('/nlp-parser/annotationgraph/?', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to parse text to a semanticgraph.');
		}
		
		nlp_parser.parseToAnnotationGraphs(req.body.text, function(err, graphs) {
			if(err) {
				var msg = "There was an error attempting to annotate sentence";
				logger.error(msg);
				return general.send500(res, msg);
			}

			var graphArray = graphs.toArraySync();

			var result = [];
			async.each(graphArray, function(graph, callback) {
				result.push(graph.pennStringSync());
				callback();
			}, function() {
				res.json(result);
				res.end();
			});
		});
	});

	//dependencygraph
	app.post('/nlp-parser/dependencygraph/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to parse text to a dependency graph.');
		}
		
		nlp_parser.parseToDependencyGraphs(req.body.text, function(err, graphs) {
			if(err) {
				var msg = "There was an error attempting to parse sentence";
				logger.error(msg);
				return general.send500(res, msg);
			}
			
			var graphArray = graphs.toArraySync();

			var result = [];
			async.each(graphArray, function(graph, callback) {
				result.push(graph.toString());
				callback();
			}, function() {
				res.json(result);
				res.end();
			});
		});
	});

	//root; child pairs; child relations;
	app.post('/nlp-parser/root-child/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to parse text to a root and child details.');
		}
		
		nlp_parser.parseRootChildData(req.body, function(err, result) {
			if(err) {
				var msg = "There was an error attempting to mark root and children";
				logger.error(msg);
				return general.send500(res, msg);
			}

			res.json(result);
			res.end();
		});
	});

	//dot product graph
	app.post('/nlp-parser/dotproductgraph/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to parse text to a dot product graph string.');
		}
		
		nlp_parser.parseToDotProductGraph(req.body, function(err, result) {
			if(err) {
				var msg = "There was an error attempting to parse sentence";
				logger.error(msg);
				return general.send500(res, msg);
			}
			res.json(result);
			res.end();
		});
	});

	//edges and verticies
	app.post('/nlp-parser/edges-vertices/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to parse text to edges and vertices.');
		}
		
		nlp_parser.parseToEdgeVertex(req.body, function(err, result) {
			if(err) {
				var msg = "There was an error attempting to get edges and vertices";
				logger.error(msg);
				return general.send500(res, msg);
			}
			res.json(result);
			res.end();
		});
	});
};

