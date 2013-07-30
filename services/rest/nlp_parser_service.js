var alpha_report_service = require('../database/alpha_report.js');
var nlp_parser = require('../parsers/nlp_parser.js');

var me = this;
var logger = null;
var app = null;

this.load = function(napp, io, gcm, log){
	nlp_parser.load(log);
	
	logger = log;
	app = napp;
	
	napp.get('/nlp-parser/start', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser start.');
		}
		
		me.parse_reports(req.query, res);
	});
	
	napp.get('/nlp-parser/stop', function(req, res){
		if(logger.DO_LOG){
			logger.info('Request for nlp parser stop.');
		}
		
		me.stop_stream(req.query, res);
	});

};

me.parse_reports = function(query, res){
	alpha_report_service.readAlphaReports(function(err,docs){
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

me.stop_stream = function(query, res){
	alpha_report_service.stopStreaming();
};