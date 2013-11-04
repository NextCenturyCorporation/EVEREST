var AlphaReportService = require('../database/alpha_report.js');
var Nlp_Parser = require('../parsers/nlp_parser_async.js');
var general = require('../general_response');
var actionEmitter = require('../action_emitter.js');

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

	// start the parser
	app.get('/nlp-parser/parse-raw-feeds/?', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser start on raw feeds.');
		}
		
		me.parse_raw_feeds(0);

		res.json({success: true});
		res.end();
	});

	me.parse_raw_feeds = function(offset){
		models.rawFeed.find({}).sort({_id: 1}).skip(offset).limit(1000).execFind(function(err, rawFeeds) {

			async.each(rawFeeds, function(feed, asyncCallback) {
				models.alphaReport.find({raw_data_id: feed._id}, function(err, alpha) {
					if(alpha.length === 0) {
						process.nextTick(function() {
							actionEmitter.rawFeedParseEvent(feed._id);
						});
					}
					asyncCallback();
				})
			});
		});

		models.rawFeed.count({}, function(err, count) {
			console.log(offset+1000);
			console.log(count);
			if((offset + 1000) < count) {
				logger.debug("Calling next thousand at offset " + (offset+1000));
				me.parse_raw_feeds(offset + 1000);
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
					text: req.body.text,
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

		nlp_parser.posTagSentences(req.body.text, function(err, output) {
			if(err) {
				var msg = "There was an error attempting to tag the sentence";
				logger.error(msg, err);
				return general.send500(res, msg);
			}
			var array = output.toArraySync();
		 	var result = [];
		 	async.each(array, function(str, callback) {
		 		result.push(str);
		 		callback();
		 	}, function() {
		 		res.json(result);
		 		res.end();
		 	});
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
				logger.error(msg, err);
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
				logger.error(msg, err);
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
		
		nlp_parser.parseRootChildData(req.body.text, function(err, result) {
			if(err) {
				var msg = "There was an error attempting to mark root and children";
				logger.error(msg, err);
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
		
		nlp_parser.parseToDotProductGraph(req.body.text, function(err, result) {
			if(err) {
				var msg = "There was an error attempting to parse sentence";
				logger.error(msg, err);
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
		
		nlp_parser.parseToEdgeVertex(req.body.text, function(err, result) {
			if(err) {
				var msg = "There was an error attempting to get edges and vertices";
				logger.error(msg, err);
				return general.send500(res, msg);
			}
			res.json(result);
			res.end();
		});
	});

	app.post('/nlp-parser/full-parse-result/?', function(req, res) {
		if(logger.DO_LOG){
			logger.info('Request for nlp parser full results.');
		}
		
		var result = {};

		async.series([function(callback) {
			nlp_parser.parseToTuples(req.body.text, function(err, tuples) {
				var results = [];
				var tuple;

				var size = tuples.sizeSync();
				for(var i = 0; i < size; i++) {
					tuple = tuples.getSync(i);
					results.push({
						entity1: tuple.getEntity1StringSync(),
						relationship: tuple.getRelationStringSync(),
						entity2: tuple.getEntity2StringSync()
					});
				}

				if (tuples) {
					result.tuples = results;
				}
				callback();
			});
		},function(callback) {
			nlp_parser.posTagSentences(req.body.text, function(err, output) {
				if(err) {
					var msg = "There was an error attempting to tag the sentence";
					logger.error(msg, err);
					result.pos = msg;
					callback();
				} else {
					output.toArray(function(err, resultArray) {
						var internalResult = [];
						async.eachSeries(resultArray, function(sentence, internalCallback) {
							internalResult.push(sentence);
							internalCallback();
						}, function() {
							result.pos = internalResult;
							callback();
						});
					});
				}
			});
		}, function(callback) {
			nlp_parser.parseToAnnotationGraphs(req.body.text, function(err, graphs) {
				if(err) {
					var msg = "There was an error attempting to annotate sentence";
					logger.error(msg, err);
					result.annotation = msg;
					callback();
				}

				graphs.toArray(function(err, graphArray) {
					var internalResult = [];
					async.eachSeries(graphArray, function(graph, internalCallback) {
						internalResult.push(graph.pennStringSync());
						internalCallback();
					}, function() {
						result.annotation = internalResult;
						callback();
					});	
				});
			});
		}, function(callback) {
			nlp_parser.parseToDependencyGraphs(req.body.text, function(err, graphs) {
				if(err) {
					var msg = "There was an error attempting to parse sentence dependency graph";
					logger.error(msg, err);
					result.dependency = msg;
					callback();
				}
				
				graphs.toArray(function(err, graphArray) {
					var internalResult = [];
					async.eachSeries(graphArray, function(graph, internalCallback) {
						internalResult.push(graph.toString());
						internalCallback();
					}, function() {
						result.dependency = internalResult;
						callback();
					});
				});
			});
		}, function(callback) {
			nlp_parser.parseRootChildData(req.body.text, function(err, output) {
				if(err) {
					var msg = "There was an error attempting to mark root and children";
					logger.error(msg, err);
					result.dependency = msg;
					callback();
				}

				output.toArray(function(err, resultArray) {
					var internalResult = [];
					async.eachSeries(resultArray, function(sentence, internalCallback) {
						internalResult.push(sentence);
						internalCallback();
					}, function() {
						result.root_child_data = internalResult;
						callback();
					});
				});
			});
		}, function(callback) {
			nlp_parser.parseToDotProductGraph(req.body.text, function(err, output) {
				if(err) {
					var msg = "There was an error attempting to parse sentence";
					logger.error(msg, err);
					result.dependency = msg;
					callback();
				}
				
				output.toArray(function(err, resultArray) {
					var internalResult = [];
					async.eachSeries(resultArray, function(sentence, internalCallback) {
						internalResult.push(sentence);
						internalCallback();
					}, function() {
						result.dot_product = internalResult;
						callback();
					});
				});
			});
		}, function(callback) {
			nlp_parser.parseToEdgeVertex(req.body.text, function(err, output) {
				if(err) {
					var msg = "There was an error attempting to get edges and vertices";
					logger.error(msg, err);
					result.edge_vertex = msg;
					callback();
				}
				

				output.toArray(function(err, resultArray) {
					var internalResult = [];
					async.eachSeries(resultArray, function(sentence, internalCallback) {
						internalResult.push(sentence);
						internalCallback();
					}, function() {
						result.edge_vertex = internalResult;
						callback();
					});
				});
			});
		}],function() {
			res.json(result);
			res.end();
		});
	});

	app.post('/nlp-parser/full-parse-result/:id([0-9a-f]+)', function(req, res) {
		if(logger.DO_LOG){
			logger.info('Request for nlp parser full results.');
		}
		
		alphaReportService.get(req.params.id, function(err, reports) {
			if(err || reports.length == 0) {
				var msg = ("Could not find alpha report with id: " + req.params.id);
				logger.error(msg, err);
				return general.send500(res, msg);
			} else {
				var report = reports[0];


				var result = {};

				async.series([function(callback) {
					nlp_parser.parseToTuples(report.message_body, function(err, tuples) {
						var results = [];
						var tuple;

						var size = tuples.sizeSync();
						for(var i = 0; i < size; i++) {
							tuple = tuples.getSync(i);
							results.push({
								entity1: tuple.getEntity1StringSync(),
								relationship: tuple.getRelationStringSync(),
								entity2: tuple.getEntity2StringSync()
							});
						}

						if (tuples) {
							result.tuples = results;
						}
						callback();
					});
				},function(callback) {
					nlp_parser.posTagSentences(report.message_body, function(err, output) {
						if(err) {
							var msg = "There was an error attempting to tag the sentence";
							logger.error(msg, err);
							console.log(err);
							result.pos = msg;
							callback();
						} else {
							output.toArray(function(err, resultArray) {
								var internalResult = [];
								async.eachSeries(resultArray, function(sentence, internalCallback) {
									internalResult.push(sentence);
									internalCallback();
								}, function() {
									result.pos = internalResult;
									callback();
								});
							});
						}
					});
				}, function(callback) {
					nlp_parser.parseToAnnotationGraphs(report.message_body, function(err, graphs) {
						if(err) {
							var msg = "There was an error attempting to annotate sentence";
							logger.error(msg, err);
							result.annotation = msg;
							callback();
						}

						graphs.toArray(function(err, graphArray) {
							var internalResult = [];
							async.eachSeries(graphArray, function(graph, internalCallback) {
								internalResult.push(graph.pennStringSync());
								internalCallback();
							}, function() {
								result.annotation = internalResult;
								callback();
							});	
						});
					});
				}, function(callback) {
					nlp_parser.parseToDependencyGraphs(report.message_body, function(err, graphs) {
						if(err) {
							var msg = "There was an error attempting to parse sentence dependency graph";
							logger.error(msg, err);
							result.dependency = msg;
							callback();
						}
						
						graphs.toArray(function(err, graphArray) {
							var internalResult = [];
							async.eachSeries(graphArray, function(graph, internalCallback) {
								internalResult.push(graph.toString());
								internalCallback();
							}, function() {
								result.dependency = internalResult;
								callback();
							});
						});
					});
				}, function(callback) {
					nlp_parser.parseRootChildData(report.message_body, function(err, output) {
						if(err) {
							var msg = "There was an error attempting to mark root and children";
							logger.error(msg, err);
							result.dependency = msg;
							callback();
						}

						output.toArray(function(err, resultArray) {
							var internalResult = [];
							async.eachSeries(resultArray, function(sentence, internalCallback) {
								internalResult.push(sentence);
								internalCallback();
							}, function() {
								result.root_child_data = internalResult;
								callback();
							});
						});
					});
				}, function(callback) {
					nlp_parser.parseToDotProductGraph(report.message_body, function(err, output) {
						if(err) {
							var msg = "There was an error attempting to parse sentence";
							logger.error(msg, err);
							result.dependency = msg;
							callback();
						}
						
						output.toArray(function(err, resultArray) {
							var internalResult = [];
							async.eachSeries(resultArray, function(sentence, internalCallback) {
								internalResult.push(sentence);
								internalCallback();
							}, function() {
								result.dot_product = internalResult;
								callback();
							});
						});
					});
				}, function(callback) {
					nlp_parser.parseToEdgeVertex(report.message_body, function(err, output) {
						if(err) {
							var msg = "There was an error attempting to get edges and vertices";
							logger.error(msg, err);
							result.edge_vertex = msg;
							callback();
						}
						

						output.toArray(function(err, resultArray) {
							var internalResult = [];
							async.eachSeries(resultArray, function(sentence, internalCallback) {
								internalResult.push(sentence);
								internalCallback();
							}, function() {
								result.edge_vertex = internalResult;
								callback();
							});
						});
					});
				}],function() {
					res.json(result);
					res.end();
				});
			}
		});
	});
};

