var AlphaReportService = require('./alpha_report.js');
var actionEmitter = require('../action_emitter.js');
var paramHandler = require('../list_default_handler.js');

var gremlin = require('gremlin');
var TitanFactory = gremlin.java.import('com.thinkaurelius.titan.core.TitanFactory');
var graphDB = TitanFactory.openSync('/home/user/Documents/titan/databases/assertions-2000');
gremlin.SetGraph(graphDB);

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
		callback(null, me.compareToAlphaReports(id));
	};
	
	me.addVertex = function(object, id_replace){
		var v = graphDB.addVertexSync(null);
		var keys = Object.keys(object);
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
	
	me.create = function(assertion_object, callback){
		var entity1 = {
			name: assertion_object.entity1,
			type: 'entity1'
			//mongo_assert_id: assertion_object._id
		};
		
		var entity2 = {
			name: assertion_object.entity2,
			type: 'entity2'
			//mongo_assert_id: assertion_object._id
		};
		
		var relationship = {
			_label: assertion_object.relationship
			//mongo_assert_id: assertion_object._id
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
		    
			callback(null, { 
				metadata: ar, 
				entity1: entity1, 
				entity2: entity2,
				relationship: relationship
			});
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
	
	me.compareToAlphaReports = function(ar){
		var alphas = gremlin.V().has('name', 'alpha report').toJSON();
		var ar_id = gremlin.v(ar).toJSON()[0]._id;
		var comparedTo = [];
		
		//gremlin-node has an issue that assesses all values that end with an f as a float
		for (var i = 0; i < 100; i++){
			var d = alphas[i];
		//alphas.forEach(function(d){
			var score = 0.0;		
			
			var ar_nodes = gremlin.v(ar).inE().outV().toJSON();
			var d_nodes = gremlin.v(d._id).inE().outV().toJSON();
			
			var ar_edges = gremlin.v(ar).inE().outV().inE().toJSON();
			var d_edges = gremlin.v(d._id).inE().outV().inE().toJSON();
			
			var ar_asserts = gremlin.v(ar).inE().outV().inE().outV().path().toJSON();
			var d_asserts = gremlin.v(d._id).inE().outV().inE().outV().path().toJSON();
			
			if (ar_nodes.length === d_nodes.length){
				score = score + 1.0;
			}
			
			if (ar_edges.length === d_edges.length){
				score = score + 1.0;
			}
			
			var ar_v_matches = me.getMatchingVertices(ar_id, d_nodes);
			score += ar_v_matches.length / d_nodes.length;

			var d_v_matches = me.getMatchingVertices(d._id, ar_nodes);
			score += d_v_matches.length / ar_nodes.length;
			
			var ar_e_matches = me.getMatchingEdges(ar_id, d_edges);
			score += ar_e_matches.length / d_edges.length;
			
			var d_e_matches = me.getMatchingEdges(d._id, ar_edges);
			score += d_e_matches.length / ar_edges.length;
			
			var ar_matches = me.getMatchingOrientation(ar_id, d_asserts);
			score += ar_matches.length / d_asserts.length;
			
			var d_matches = me.getMatchingOrientation(d._id, ar_asserts);
			score += d_matches.length / ar_asserts.length;
			
			/*ar.setPropertySync('comparedTo', [JSON.stringify({
				item_id: d._id,
				score: score
			})]);*/
			
			comparedTo.push({
				item_id: d._id,
				score: 100 * score / 8
			});
			
	  	  	//graphDB.commitSync();
	  	 }	
		//});
		return comparedTo.sort(function(a,b){ return b.score - a.score });
	};
};