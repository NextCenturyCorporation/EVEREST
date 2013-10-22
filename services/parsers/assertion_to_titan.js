/**
	This will run only if the titan server is already running.
*/

var request = require('request');
var titanAddress = 'http://everest-build:8182/graphs/graph';
var mongoAddress = 'http://everest-build:8081/';

module.exports = function(models, io, logger){
	var me = this;
	
	me.buildNode = function(node){
		var query = titanAddress + '/vertices?';
	
		var keys = Object.keys(node);
		keys.forEach(function(key){
			if (key === '_id'){
				query += 'mongo_ar_id=' + node[key];
			} else {
				query += key + '=' + node[key];
			}
			
			query += '&';
		});
		return query;
	};
	
	me.buildEdge = function(edge){
		var outV = edge.source;
		var inV = edge.target;
		var query = titanAddress + '/edges?_outV=' + outV + '&_inV=' + inV + '&';
		var keys = Object.keys(edge);
		keys.forEach(function(key, i){
			query += key + '=' + edge[key] + '&';
		});
		return query;
	};
	
	me.attachToMetadata = function(meta, node, callback){
		request.post(me.buildNode(node), function(err, res, body){
			if (err){
				logger.info('An error occured while attempting to save node', err);
			} else {
				node._titan_id = JSON.parse(body).results._id;
				request({
					uri: me.buildEdge({
						source: node._titan_id,
						target: meta._titan_id,
						_label: 'metadata of' 
					}),
					method: 'POST'
				}, function(err, res, body){
					if (err){
						logger.info('An error occured while attempting to attach node to metadata', err);
					} else {
						callback(body);
					}
				});
			}
		});
	};
	
	me.save = function(assertion_object){
		console.log(assertion_object);
		logger.info('Attempting to save assertion_object to titan with id ' + assertion_object._id);
		var alpha_report_object = {};
		var titan_assertion_object = {};
		var ar_id = assertion_object.alpha_report_id;
		var entity1 = {
			name: assertion_object.entity1,
			type: 'entity1',
			mongo_assert_id: assertion_object._id
		};
		
		var entity2 = {
			name: assertion_object.entity2,
			type: 'entity2',
			mongo_assert_id: assertion_object._id
		};
		
		var relationship = {
			_label: assertion_object.relationship,
			mongo_assert_id: assertion_object._id
		};
		
		request(mongoAddress + 'alpha-report/' + ar_id, function(err, res, body){
			if (err) {
				logger.error("An error occurred while retrieving alpha_report", err);
			} else {
				alpha_report_object = JSON.parse(body)[0];
				console.log(alpha_report_object);
				
				
				if ( alpha_report_object ){
					request.post(me.buildNode(alpha_report_object), function(err, res, body){
						if (err){
							logger.info('An error occured while attempting to save the metadata node');
						} else {
							titan_assertion_object.metadata = JSON.parse(body).results;
							alpha_report_object._titan_id = titan_assertion_object.metadata._id;
							console.log(alpha_report_object);
						
							me.attachToMetadata(alpha_report_object, entity1, function(body){
							titan_assertion_object.entity1 = JSON.parse(body).results;
								me.attachToMetadata(alpha_report_object, entity2, function(body){
									titan_assertion_object.entity2 = JSON.parse(body).results;
									relationship.source = entity1._titan_id;
									relationship.target = entity2._titan_id;
									request.post(me.buildEdge(relationship), function(err, res, body){
										if (err){
											logger.info('An error occured while attempting to save assertion_object', err);
										} else {
											titan_assertion_object.relationship = JSON.parse(body).results;
											console.log(titan_assertion_object);
										}
									});
								});
							});
						}
					});
				}
			}
		});
	};
};