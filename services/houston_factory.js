//------------
// houston_factory.js
//------------
// a composable event engine for mediating
// the interactions between node.js modules

/**
 * @namespace
 */
var HoustonFactory;


HoustonFactory = {
	// Creates a Houston instance and populates it with modules and rule sets
	createHouston: function(){

		this.Houston = require('./houston.js');
		//console.log(this.Houston);
		//console.log('Creating modules');
		this.createModules('./database/');
		//console.log('Creating rule sets');
		this.createRulesets('./rulesets/');

		return this.Houston;
	},

	// Create modules for Houston
	// @param {String} moduleDir the directory to look for modules
	createModules: function(moduleDir){
		var me = this;
		var fs = require('fs');
		//Comment this out if you want to just manually require each service
		//this will just require every service defined in the database folder.

		fs.readdirSync(moduleDir).forEach(function(file) {
			var fileparts = file.split('.');
			var filename = fileparts[0];
			try {
				//console.log(file);

				var module = require(moduleDir + file);
			} catch (e){
				console.log("error creating module " + filename + ": " + e);
				return;
			}

			me.Houston.registerModule(filename, module);
		});
	},

	// Create the rulesets from the given directory location
	// @param {String} rulesetDir the directory to look for rulesets
	createRulesets: function(rulesetDir){
		var me = this;

	 	var HoustonRuleSetParser = require('./houston_ruleset_parser.js');
	 	var fs = require('fs');
	 	var path = require('path');
	 	fs.readdirSync(rulesetDir).forEach(function(file){
	 		
	 		// get file extension
	 		var fileparts = file.split(".");
	 		var ext = fileparts[1];
	 		
	 		// get contents of file
	 		var contents = fs.readFileSync(rulesetDir + file);
	 		var json;
 			if(ext === "hrs"){
 				try {
 					json = HoustonRuleSetParser.parse(contents);
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
	 			me.Houston.addRuleset(jsonArray[i]);
	 		};
	 	});
		console.log(me.Houston);
	}

}

module.exports = HoustonFactory;


var hf = HoustonFactory;
var houston = hf.createHouston();
houston.trigger('onTwitter', 'twitter');
houston.trigger('onRSS', 'RSS');