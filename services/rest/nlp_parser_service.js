var AlphaReportService = require('../database/alpha_report.js');
var AssertionService = require('../database/assertion.js');
var Nlp_Parser = require('../parsers/nlp_parser.js');

module.exports = function(app, models, io, logger){
	var me = this;

	me.logger = logger;
	me.app = app;
	me.io = io;
	me.models = models;

	var alphaReportService = new AlphaReportService(models, io, logger);

	var services = {assertion: new AssertionService(models, io, logger)};
	var nlp_parser = new Nlp_Parser(services, logger);
	
	// start the parser
	app.get('/nlp-parser/parse', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser start.');
		}
		
		me.parse_reports(req.query, res);
	});
	
	// post text to get back tuples
	app.post('/nlp-parser/parse/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to parse text.');
		}
		
		nlp_parser.parseToTuples(req.body, function(tuples) {
			if (tuples) {
				res.json(tuples);
			}
			res.end();
		});
	});

	// turn text into semanticgraphs
	app.post('/nlp-parser/semanticgraph/', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser to parse text to a semanticgraph.');
		}
		
		nlp_parser.parseToSemanticGraphs(req.body, function(graphs) {
			if (graphs) {
				res.json(graphs);
			}
			res.end();
		});
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
};

