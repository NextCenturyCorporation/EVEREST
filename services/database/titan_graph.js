var AlphaReportService = require('./alpha_report.js');
var actionEmitter = require('../action_emitter.js');
var paramHandler = require('../list_default_handler.js');

var gremlin = require('gremlin');
var async = require('async');
var TitanFactory = gremlin.java.import('com.thinkaurelius.titan.core.TitanFactory');
var graphDB = TitanFactory.openSync('/titan/databases/assertions-200b');
gremlin.SetGraph(graphDB);

var indexOfId = function(array, id){
	for (var i = 0; i < array.length; i++ ){
		if (id === JSON.parse(array[i]).item_id){
			return i;
		}
	}
	return -1;
}

module.exports = function(models, io, logger) {
	var me = this;
	var alphaReportService = new AlphaReportService(models, io, logger);
	
	me.listVertices = function(config, callback){
		var all = {};
		var field = Object.keys(config)[0];
		if ( config[field] === 'alpha report' || config[field] === 'target event' ){
			all = gremlin.V().has(field, config[field]).toJSON();
		} else {
			all = gremlin.V().has(field, config[field]).outE().has("label","metadata of").inV().toJSON();
		}
		
		callback(null, all);
	};
	
	me.listEdges = function(config, callback){
		var field = Object.keys(config)[0];
		var all = gremlin.E().has(field, config[field]).toJSON();
		callback(null, all);
	};
	
	me.getPath = function(id, callback){
		callback(null, gremlin.v(id).inE().outV().inE().outV().path().toJSON());
	};

	me.compare = function(id, callback){
		callback(null, me.compareToAll(id));
	};
	
	me.addVertex = function(object, id_replace){
		var v = graphDB.addVertexSync(null);
		var keys = Object.keys(object);
		
		//async.each(keys, function(k){
	    keys.forEach(function(k){
	    	if (k === '_id'){
	    		v.setPropertySync(id_replace, object[k]);
	    	} else {
		        v.setPropertySync(k, object[k]);
			}
	    });
	    object._titan_id = gremlin.v(v).toJSON()[0]._id; 
	    graphDB.commitSync();
	    return v;
	};
	
	me.create = function(assertion_object){
		console.log(assertion_object);
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
		    
		    me.compareToAll(ar._titan_id);
		    
			console.log(JSON.stringify({ 
				metadata: ar, 
				entity1: entity1, 
				entity2: entity2,
				relationship: relationship
			}));
		});
	};
	
	me.getMatchingVertices = function(id, array){
		var verts = [];
		for (var i = 0; i < array.length; i++){
			var match = gremlin.v(id).inE().outV().has("name", array[i].name);
			
			if ( match.toJSON().length != 0 ){
				verts.push(match.toJSON());
			}
		}
		return verts;
	};
	
	me.getMatchingEdges = function(id, array){
		var edges = [];
		for (var i = 0; i < array.length; i++){
			var match = gremlin.v(id).inE().outV().inE().has("label", array[i]._label);
			if ( match.toJSON().length != 0 ){
				edges.push(match.toJSON());
			}
		}
		return edges;
	};
	
	me.getMatchingOrientation = function(id, array){
		var assertions = [];
		for (var i = 0; i < array.length; i++){
			var match = gremlin.v(id).inE().outV().has("name", array[i][2].name).inE().has("label", array[i][3]._label).outV().has("name", array[i][4].name);
			if ( match.toJSON().length != 0 ){
				assertions.push(match.toJSON());
			}
		}
		return assertions;
	};
	
	me.compareToAll = function(ar_id){
		ar_id = parseInt(ar_id, 10);
		var alphas = gremlin.V().has('name', 'alpha report').toJSON();
		var targets = gremlin.V().has('name', 'target event').toJSON();
		var all = alphas.concat(targets);
		var a_json = gremlin.v(ar_id).toJSON()[0];
		
		//gremlin.v(ar_id).iterator().nextSync().setPropertySync('comparedTo', []);
		//graphDB.commitSync();
		var comparedTo = a_json.comparedTo;
		
		//async.each(alphas, function(d){
		alphas.forEach(function(d){
			var score = 0.0;
			//gremlin.v(d._id).iterator().nextSync().setPropertySync('comparedTo', []);
			//graphDB.commitSync();
			if (indexOfId(comparedTo, d._id) === -1){
				var d_comparedTo = gremlin.v(d._id).toJSON()[0].comparedTo;
				
				var ar_nodes = gremlin.v(ar_id).inE().outV().toJSON();
				var d_nodes = gremlin.v(d._id).inE().outV().toJSON();
				
				var ar_edges = gremlin.v(ar_id).inE().outV().inE().toJSON();
				var d_edges = gremlin.v(d._id).inE().outV().inE().toJSON();
				
				var ar_asserts = gremlin.v(ar_id).inE().outV().inE().outV().path().toJSON();
				var d_asserts = gremlin.v(d._id).inE().outV().inE().outV().path().toJSON();
				
				if (ar_nodes.length === d_nodes.length){
					score = score + 1.0;
				}
				
				if (ar_edges.length === d_edges.length){
					score = score + 1.0;
				}
				
				if (d_nodes.length !== 0 && ar_nodes.length !== 0){
					var ar_v_matches = me.getMatchingVertices(ar_id, d_nodes);
					score += ar_v_matches.length / d_nodes.length;
	
					var d_v_matches = me.getMatchingVertices(d._id, ar_nodes);
					score += d_v_matches.length / ar_nodes.length;
				}
				
				if (d_edges.length !== 0 && ar_edges.length !== 0){
					var ar_e_matches = me.getMatchingEdges(ar_id, d_edges);
					score += ar_e_matches.length / d_edges.length;
					
					var d_e_matches = me.getMatchingEdges(d._id, ar_edges);
					score += d_e_matches.length / ar_edges.length;
				}
				
				if (d_asserts.length !== 0 && ar_asserts.length !== 0){
					var ar_matches = me.getMatchingOrientation(ar_id, d_asserts);
					score += ar_matches.length / d_asserts.length;
					
					var d_matches = me.getMatchingOrientation(d._id, ar_asserts);
					score += d_matches.length / ar_asserts.length;
				}
				
				comparedTo.push(JSON.stringify({
					item_id: d._id,
					score: 100 * score / 8
				}));
				
				d_comparedTo.push(JSON.stringify({
					item_id: ar_id,
					score: 100 * score / 8
				}));
								
				gremlin.v(d._id).iterator().nextSync().setPropertySync('comparedTo', d_comparedTo);
		  	  	graphDB.commitSync();	
	  	  	}
		});
		
		comparedTo.sort(function(a,b){
			var ja = JSON.parse(a);
			var jb = JSON.parse(b);
			if (jb.score === ja.score){
				return ja.item_id - jb.item_id;
			} else {
				return jb.score - ja.score;
			}
		});
		
		gremlin.v(ar_id).iterator().nextSync().setPropertySync('comparedTo', comparedTo);
		graphDB.commitSync();
		
		var parsed = [];
		
		//async.each(comparedTo, function(d){
		comparedTo.forEach(function(d){
			parsed.push(JSON.parse(d));
		});
		return parsed;
	};
};