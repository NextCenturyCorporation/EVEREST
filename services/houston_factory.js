//------------
// houston_factory.js
//------------
// a composable event engine for mediating
// the interactions between node.js modules


var HoustonFactory;


HoustonFactory = {

	var Houston;


	createHouston: function(){

		Houston = require('./houston.js');
		console.log('Creating modules');
		this.createModules('./');


	};

	createModules: function(moduleDir){
		var fs = require('fs');
		//Comment this out if you want to just manually require each service
		//this will just require every service defined in the database folder.

		fs.readdirSync(moduleDir).forEach(function(file) {
			var filename = file.stripFileDesignation();
			var module = require('./database/' + file);

			console.log("creating module " + filename + ".");
			// TO DO: Module object?
			Houston.registerModule(filename, module);

		});
	};

	// createRulesets = function(rulesetDir){



	// };

}