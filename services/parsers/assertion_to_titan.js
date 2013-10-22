/**
	This will run only if the titan server is already running.
	Comparisons would have to go onto mongo.
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
		request.post(buildNode(node), function(error, response, body){
			node._titan_id = JSON.parse(body).results._id;
			request({
				uri: buildEdge({
					source: node._titan_id,
					target: meta._titan_id,
					_label: 'metadata of' 
				}),
				method: 'POST'
			}, function(error, response, body){
				console.log(JSON.parse(body).results);
				callback();
			});
		});
	};
	
	me.save = function(assertion_object){
		var alpha_report_object = {};
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
			alpha_report_object = JSON.parse(body)[0];
			console.log(alpha_report_object);
			
			if ( alpha_report_object._titan_id <= 0 ){
				request.post(buildNode(alpha_report_object), function(err, res, body){
					alpha_report_object._titan_id = JSON.parse(body).results._id;
					console.log(alpha_report_object);
				
					attachToMeta(alpha_report_object, entity1, function(){
						attachToMeta(alpha_report_object, entity2, function(){
							relationship.source = entity1._titan_id;
							relationship.target = entity2._titan_id;
							request.post(buildEdge(relationship), function(err, res, body){
								console.log(JSON.parse(body).results);
							});
						});
					});
				});
			}
		});
	};
};