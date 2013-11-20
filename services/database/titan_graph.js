var AlphaReportService = require('./alpha_report.js');
var TargetAssertionService = require('./target_assertion.js');
var TargetEventService = require('./target_event.js');

var gremlin = require('gremlin');
var async = require('async');
var TitanFactory = gremlin.java.import('com.thinkaurelius.titan.core.TitanFactory');
var graphDB = TitanFactory.openSync('titan/assertions');	//from same dir as app.js?
gremlin.SetGraph(graphDB);

var indexOfId = function(array, id){
	for (var i = 0; i < array.length; i++ ){
		if (id === JSON.parse(array[i]).item_id){
			return i;
		}
	}
	return -1;
};

module.exports = function(models, io, logger) {
	var me = this;
	var alphaReportService = new AlphaReportService(models, io, logger);
	var targetAssertionService = new TargetAssertionService(models, io, logger);
	var targetEventService = new TargetEventService(models, io, logger);
	
	me.list = function(config, callback) {
		var verts = gremlin.V().toJSON();
		var edges = gremlin.E().toJSON();
		var error = verts.error || edges.error;
		callback(error, verts.concat(edges));
	};
	
	me.listVertices = function(config, callback) {
		var all = {};
		var keys = Object.keys(config);
		
		if (keys.length === 1) {
			var field = keys[0];
			if ( config[field] === 'alpha report' || config[field] === 'target event' ){
				all = gremlin.V().has(field, config[field]).toJSON();
			} else {
				all = gremlin.V().has(field, config[field]).outE().has("label","metadata of").inV().toJSON();
			}
		} else {
			all = gremlin.V().toJSON();
		}
		
		callback(all.error, all);
	};
	
	me.getPath = function(id, callback){
		var all = gremlin.v(id).inE().outV().inE().outV().path().toJSON();
		callback(all.error, all);
	};
	
	me.compare = function(id, callback){
		callback(null, me.compareAll(id));
	};
	
	me.addVertex = function(object, id_replace, callback){
		var v = graphDB.addVertexSync(null);
		var keys = Object.keys(object);
		console.log(object);
		if (object.type === 'metadata') {
			v.setPropertySync('comparedTo', []);
		}
		
		//async.each(keys, function(k){
	    keys.forEach(function(k){
	        if (object[k]){
	            if (k === '_id'){
	                v.setPropertySync(id_replace, object[k]);
	            } else {
	                v.setPropertySync(k, object[k]);
	            }
	        }
	    });
	    object._titan_id = gremlin.v(v).toJSON()[0]._id; 
	    graphDB.commitSync();
	    
	    if (callback) {
	        callback(null, object);
	    }
	    
	    return v;
	};
	
	me.addEdge = function(object, id_replace, callback) {
		console.log(object);
		var v1 = gremlin.v(object.source_id).iterator().nextSync();
		var v2 = gremlin.v(object.target_id).iterator().nextSync();
		var rel = graphDB.addEdgeSync(null, v1, v2, object._label);
		object._titan_id = gremlin.e(rel).toJSON()[0]._id;
		graphDB.commitSync();
		
		if (callback) {
        callback(null, object);
    }
	};
	
	me.create = function(assertion_object, callback){
		var entity1 = {
			name: assertion_object.entity1,
			type: 'entity1',
			mongo_assert_id: JSON.stringify(assertion_object._id)
		};
		
		var entity2 = {
			name: assertion_object.entity2,
			type: 'entity2',
			mongo_assert_id: JSON.stringify(assertion_object._id)
		};
		
		var relationship = {
			_label: assertion_object.relationship,
			mongo_assert_id: JSON.stringify(assertion_object._id)
		};
		
		alphaReportService.get(assertion_object.alpha_report_id, function(err, docs){
			if ( err || docs[0] === undefined ){
				callback("Alpha Report ID does not exist", {});
			} else {
				var ar = JSON.parse(JSON.stringify(docs[0]));
				ar.name = 'alpha report';
				ar.type = 'metadata';
				ar.comparedTo = [];
				
				var meta = me.addVertex(ar, 'mongo_ar_id');
				
				var v1 = me.addVertex(entity1, 'mongo_assert_id');
				graphDB.addEdgeSync(null, v1, meta, 'metadata of');
					
				var v2 = me.addVertex(entity2, 'mongo_assert_id');
				graphDB.addEdgeSync(null, v2, meta, 'metadata of');
				
				var rel = graphDB.addEdgeSync(null, v1, v2, assertion_object.relationship);
				relationship._titan_id = gremlin.e(rel).toJSON()[0]._id;
		        graphDB.commitSync();
		        
		        me.compareAll(ar._titan_id);
				
				callback(null, { 
					metadata: ar, 
					entity1: entity1, 
					entity2: entity2,
					relationship: relationship
				});
			}
		});
	};
	
	me.getMatchingVertices = function(id, array){
		var verts = [];
		for (var i = 0; i < array.length; i++){
			var match = gremlin.v(id).inE().outV().has("name", array[i].name);
			
			if ( match.toJSON().length !== 0 ){
				verts.push(match.toJSON());
			}
		}
		return verts;
	};
	
	me.getMatchingEdges = function(id, array){
		var edges = [];
		for (var i = 0; i < array.length; i++){
			var match = gremlin.v(id).inE().outV().inE()
				.has("label", array[i]._label);
				
			if ( match.toJSON().length !== 0 ){
				edges.push(match.toJSON());
			}
		}
		return edges;
	};
	
	me.getMatchingOrientation = function(id, array){
		var assertions = [];
		for (var i = 0; i < array.length; i++){
			var match = gremlin.v(id).inE().outV()
				.has("name", array[i][2].name).inE()
				.has("label", array[i][3]._label).outV()
				.has("name", array[i][4].name);
				
			if ( match.toJSON().length !== 0 ){
				assertions.push(match.toJSON());
			}
		}
		return assertions;
	};
	
	me.compareAll = function(id){
		id = parseInt(id, 10);
		var alphas = gremlin.V().has('name', 'alpha report').toJSON();
		var targets = gremlin.V().has('name', 'target event').toJSON();
		var all = alphas.concat(targets);
		var a_json = gremlin.v(id).toJSON()[0];
		console.log('new');
		console.log(a_json);
		
		//gremlin.v(id).iterator().nextSync().setPropertySync('comparedTo', []);
		//graphDB.commitSync();
		var comparedTo = a_json.comparedTo;
		
		//async.each(all, function(d){
		all.forEach(function(d){
			console.log('currently compared to');
			console.log(d);
			var score = 0.0;
			//gremlin.v(d._id).iterator().nextSync().setPropertySync('comparedTo', []);
			//graphDB.commitSync();
			if (indexOfId(comparedTo, d._id) === -1){
				var d_comparedTo = gremlin.v(d._id).toJSON()[0].comparedTo;
				var ar_nodes = gremlin.v(id).inE().outV().toJSON();
				var d_nodes = gremlin.v(d._id).inE().outV().toJSON();
				console.log(ar_nodes);
				
				var ar_edges = gremlin.v(id).inE().outV().inE().toJSON();
				var d_edges = gremlin.v(d._id).inE().outV().inE().toJSON();
				
				var ar_asserts = gremlin.v(id).inE().outV().inE().outV().path().toJSON();
				var d_asserts = gremlin.v(d._id).inE().outV().inE().outV().path().toJSON();
				
				if (ar_nodes.length === d_nodes.length){
					score = score + 1.0;
				}
				
				if (ar_edges.length === d_edges.length){
					score = score + 1.0;
				}
				
				if (d_nodes.length !== 0 && ar_nodes.length !== 0){
					var ar_v_matches = me.getMatchingVertices(id, d_nodes);
					score += ar_v_matches.length / d_nodes.length;
	
					var d_v_matches = me.getMatchingVertices(d._id, ar_nodes);
					score += d_v_matches.length / ar_nodes.length;
				}
				
				if (d_edges.length !== 0 && ar_edges.length !== 0){
					var ar_e_matches = me.getMatchingEdges(id, d_edges);
					score += ar_e_matches.length / d_edges.length;
					
					var d_e_matches = me.getMatchingEdges(d._id, ar_edges);
					score += d_e_matches.length / ar_edges.length;
				}
				
				if (d_asserts.length !== 0 && ar_asserts.length !== 0){
					var ar_matches = me.getMatchingOrientation(id, d_asserts);
					score += ar_matches.length / d_asserts.length;
					
					var d_matches = me.getMatchingOrientation(d._id, ar_asserts);
					score += d_matches.length / ar_asserts.length;
				}
				
				comparedTo.push(JSON.stringify({
					item_id: d._id,
					score: 100 * score / 8,
					name: d.name
				}));
				
				d_comparedTo.push(JSON.stringify({
					item_id: id,
					score: 100 * score / 8,
					name: a_json.name
				}));
				
				d_comparedTo.sort(function(a, b) {
					var ja = JSON.parse(a);
					var jb = JSON.parse(b);
					if (jb.score === ja.score){
						return ja.item_id - jb.item_id;
					} else {
						return jb.score - ja.score;
					}
				});
								
				gremlin.v(d._id).iterator().nextSync().setPropertySync('comparedTo', d_comparedTo);
				graphDB.commitSync();	
			}
		});
		
		comparedTo.sort(function(a, b) {
			var ja = JSON.parse(a);
			var jb = JSON.parse(b);
			if (jb.score === ja.score){
				return ja.item_id - jb.item_id;
			} else {
				return jb.score - ja.score;
			}
		});
		
		console.log(comparedTo);
		gremlin.v(id).iterator().nextSync().setPropertySync('comparedTo', comparedTo);
		graphDB.commitSync();
		
		var parsed = [];
		
		//async.each(comparedTo, function(d){
		comparedTo.forEach(function(d){
			parsed.push(JSON.parse(d));
		});
		
		return parsed;
	};
	
	me.del = function(id, callback){
		var vertex = gremlin.v(id).iterator().nextSync();
		var error = false;
		if (vertex) {
			vertex.removeSync();
			graphDB.commitSync();
		} else { 
			error = true;
		}
		
		callback(error, {_id: id});
	};
	
	me.deleteAll = function(callback) {
		var vertices = gremlin.V().iterator();
		var element;
		var count = 0;
		while (vertices.hasNextSync()) {
			element = vertices.nextSync();
			element.removeSync();
			count++;
		}
		graphDB.commitSync();
		
		callback(null, {deleted_count: count});
	};
};