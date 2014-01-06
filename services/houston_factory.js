//------------
// houston_factory.js
//------------
// a composable event engine for mediating
// the interactions between node.js modules


var HoustonFactory;


HoustonFactory = {

	var Houston;

	// Creates a Houston instance and populates it with modules and rule sets
	createHouston: function(){

		Houston = require('./houston.js');
		console.log('Creating modules');
		this.createModules('./database/');
		console.log('Creating rule sets');
		this.createRulesets('.');

	};

	// Create modules for Houston
	// @param {String} moduleDir the directory to look for modules
	createModules: function(moduleDir){
		var fs = require('fs');
		//Comment this out if you want to just manually require each service
		//this will just require every service defined in the database folder.

		fs.readdirSync(moduleDir).forEach(function(file) {
			var filename = file.stripFileDesignation();
			try {
				var module = require(file);
			} catch (e){
				console.log("error creating module " + filename);
				return;
			}
			Houston.registerModule(filename, module);
		});
	};

	// Create the rulesets from the given directory location
	// @param {String} rulesetDir the directory to look for rulesets
	createRulesets = function(rulesetDir){

	 	var HoustonRuleSetParser = require('./houston_ruleset_parser.js');
	 	var fs = require('fs');
	 	var path = require('path');
	 	fs.readdirSync(rulesetDir).forEach(function(file){
	 		
	 		// get file extension
	 		var ext = path.extname(file).split('.');
	 		ext = ext[ext.length - 1];
	 		
	 		// get contents of file
	 		var contents = fs.readFileSync(file);
	 		var json;
 			if(ext === "hrs"){
 				try {
 					json = Houston.HoustonRuleSetParser.parser(contents);
 				} catch (e){
 					console.log("error creating rulesets from hrs file " + file + ": " + e);
 					return;
 				}
 			} else if(ext === "json"){
 				try {
 					json = JSON.parse(contents);
					} catch (e){
						console.log("error creating rulesets from hrs file " + file + ": " + e);
						return;
 				}
 			} else {
 				return;
 			}
 			var jsonArray = [].concat(json);
	 		for (var i = jsonArray.length - 1; i >= 0; i--) {
	 			Houston.addRulset(jsonArray[i]);
	 		};
	 	});

	};

}

module.exports = HoustonFactory;