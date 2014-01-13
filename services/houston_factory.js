/**
 * @fileOverview HoustonFactory is responsible for creating EVEREST's
 *               Houston object, a composable event engine for mediating
 *               the interactions between node.js modules.
 *               HoustonFactory uses the open-source Dependable npm module
 *               from i.TV LLC for simple dependency injection.
 *
 * @author Next Century Corporation
 * @version 0.0.1
 */

/*                     *\
| module-wide variables |
\*                     */

/**
 * @namespace
 */
var HoustonFactory;

// the createHouston function
var createHouston;
// the HoustonRulesetParser module
var houstonRulesetParser;
// the open-source Dependable npm module from i.TV LLC
var dependable;
// the file system module
var fs;
// the path module
var path;

/*                         *\
| end module-wide variables |
\*                         */

/*                                       *\
| initialization of module-wide variables |
\*                                       */

createHouston = require('./houston');
houstonRulesetParser = require('./houston_ruleset_parser');
dependable = require('dependable');
fs = require('fs');
path = require('path');

/*                                           *\
| end initialization of module-wide variables |
\*                                           */

/*                                 *\
| creation of HoustonFactory object |
\*                                 */

HoustonFactory = {

    /*       *\
    | methods |
    \*       */

    /**
     * Creates EVEREST's Houston object, automatically populating it with
     * the modules (.js) and rulesets (.hrs or .json) found at
     * the provided module path and ruleset path.
     * @param {String|String[]} modulePaths the path/paths to the modules (.js)
     * @param {String|String[]} rulesetPaths the path/paths to the rulesets
     *                                       (.hrs or .json)
     * @param {Object} dependencies a dictionary of all the dependencies
     *                              that the modules will need
     * @param {Object} dependencies.logger the logger object used to log errors
     *                                     in creating EVEREST's Houston object
     * @returns {Houston} EVEREST's Houston object
     * @throws {String} a string error message if
     *                  no module paths provided or
     *                  no ruleset paths provided
     */
    createHouston: function(modulePaths, rulesetPaths, dependencies) {
        /*      *\
        | locals |
        \*      */

        // the Houston object
        var houston;
        // the dependency injection container
        var container;
        // the logger
        var logger;
        // the module names
        var moduleNames;
        // the module dictionary
        var modules;
        // the closures
        var loadModulePaths;
        var loadModulePath;
        var loadRulesetPaths;
        var loadRulesetPath;
        var splitFileExt;
        var convertFileNameToModuleName;

        /*          *\
        | end locals |
        \*          */

        /*        *\
        | closures |
        \*        */

        /**
         * Loads multiple module paths into Houston.
         * Uses dependencies.logger to log any error messages.
         * @param {String} modulePaths the paths to the modules
         */
        loadModulePaths = function(modulePaths) {
            /*      *\
            | locals |
            \*      */
            // the number of modules paths
            var numModulePaths;
            // loop variable
            var i;
            // the current module path
            var modulePath;
            // the number of module names
            var numModuleNames;
            // the current module name
            var moduleName;
            // the module object
            var moduleObject;
            /*          *\
            | end locals |
            \*          */
            // Loop through the module paths.
            numModulePaths = modulePaths.length;
            for (i = 0; i < numModulePaths; i++) {
                modulePath = modulePaths[i];
                // Attempt to load the module path.
                try {
                    loadModulePath(modulePath);
                }
                catch (e) {
                    logger.error(
                        'unable to load module path "' + modulePath +
                        '" because ' + e
                    );
                }
            }
            // Loop through the module names.
            numModuleNames = moduleNames.length;
            for (i = 0; i < numModuleNames; i++) {
                moduleName = moduleNames[i];
                // Attempt to resolve the current module name into
                // a module object using the dependency injection container.
                try {
                    moduleObject = container.get(moduleName);
                }
                catch (e) {
                    logger.error(
                        'unable to resolve module "' + moduleName +
                        '" because ' + e
                    );
                    // Skip this module!
                    continue;
                }
                // If no module object, skip this module!
                if (!moduleObject) {
                    continue;
                }
                // Add the module object to the module dictionary.
                modules[moduleName] = moduleObject;
            }
            // Add the module dictionary to Houston.
            houston.addModuleSync(modules);
        };

        /**
         * Loads a single module path into Houston.
         * Uses dependencies.logger to log any error messages.
         * @param {String} modulePath the path to the modules
         */
        loadModulePath = function(modulePath) {
            /*      *\
            | locals |
            \*      */
            // the files
            var files;
            // the number of files
            var numFiles;
            // loop variable
            var i;
            // the current file
            var file;
            // the parts of the file in array form
            // (The first element is the file name.
            //  The second element is the file extension.)
            var fileParts;
            // the file name
            var fileName;
            // the file extension
            var fileExt;
            // the module name
            var moduleName;
            // the module object
            var moduleObject;
            /*          *\
            | end locals |
            \*          */
            // Grab the module files and loop through them.
            files = fs.readdirSync(modulePath);
            numFiles = files.length;
            for (i = 0; i < numFiles; i++) {
                file = files[i];
                // Grab the file parts, the file name, and the file extension.
                fileParts = splitFileExt(file);
                fileName = fileParts[0];
                fileExt = fileParts[1];
                // If not JavaScript file, skip this file!
                if (fileExt !== '.js') {
                    continue;
                }
                // Grab the module name.
                moduleName = convertFileNameToModuleName(fileName);
                // Load the module object.
                try {
                    moduleObject = require(
                        './' + path.join(modulePath, fileName)
                    );
                }
                catch (e) {
                    logger.error(
                        'unable to load JavaScript file "' + file +
                        '" because ' + e
                    );
                    // Skip this file!
                    continue;
                }
                // Register the module object with the dependency
                // injection container.
                try {
                    container.register(moduleName, moduleObject);
                }
                catch (e) {
                    logger.error(
                        'unable to register module "' + moduleName +
                        '" with the dependency injection container because ' + e
                    );
                    // Skip this file!
                    continue;
                }
                // Since we were successful,
                // add the module name to the array of module names.
                moduleNames.push(moduleName);
            }
        };

        /**
         * Loads multiple ruleset paths into Houston.
         * Uses dependencies.logger to log any error messages.
         * @param {String} rulesetPaths the paths to the rulesets
         */
        loadRulesetPaths = function(rulesetPaths) {
            /*      *\
            | locals |
            \*      */
            // the number of ruleset paths
            var numRulesetPaths;
            // loop variable
            var i;
            // the current ruleset path
            var rulesetPath;
            /*          *\
            | end locals |
            \*          */
            // Loop through the ruleset paths.
            numRulesetPaths = rulesetPaths.length;
            for (i = 0; i < numRulesetPaths; i++) {
                rulesetPath = rulesetPaths[i];
                // Attempt to load the ruleset path.
                try {
                    loadRulesetPath(rulesetPath);
                }
                catch (e) {
                    logger.error(
                        'unable to load ruleset path "' + rulesetPath +
                        '" because ' + e
                    );
                }
            }
        };

        /**
         * Loads a single ruleset path into Houston.
         * Uses dependencies.logger to log any error messages.
         * @param {String} rulesetPath the path to the rulesets
         */
        loadRulesetPath = function(rulesetPath) {
            /*      *\
            | locals |
            \*      */
            // the ruleset files
            var files;
            // the number of ruleset files
            var numFiles;
            // loop variable
            var i;
            // the current ruleset file
            var file;
            // the file extension
            var fileExt;
            // the file contents
            var fileContents;
            // the ruleset dictionaries
            var rulesets;
            /*          *\
            | end locals |
            \*          */
            // Grab the ruleset files and loop through them.
            files = fs.readdirSync(rulesetPath);
            numFiles = files.length;
            for (i = 0; i < numFiles; i++) {
                file = files[i];
                // Grab the file extension.
                fileExt = splitFileExt(file)[1];
                // If neither HRS nor JSON file, skip this file!
                if (fileExt !== '.hrs' && fileExt !== '.json') {
                    continue;
                }
                // Grab the file contents.
                fileContents = fs.readFileSync(
                    path.join(rulesetPath, file),
                    {
                        encoding: 'utf8'
                    }
                );
                // If HRS file, use the custom HoustonRulesetParser object
                // to parse the file contents.
                if (fileExt === '.hrs') {
                    try {
                        rulesets = houstonRulesetParser.parse(fileContents);
                    } catch (e) {
                        logger.error(
                            'unable to parse HRS file "' + file +
                            '" because ' + e
                        )
                        // Skip this file!
                        continue;
                    }
                }
                // Else, if JSON file, use the built-in JSON object
                // to parse the file contents.
                else if (fileExt === '.json') {
                    try {
                        rulesets = JSON.parse(fileContents);
                    } catch (e) {
                        logger.error(
                            'unable to parse JSON file "' + file +
                            '" because ' + e
                        )
                        // Skip this file!
                        continue;
                    }
                }
                // Coerce the rulesets variable into an array and
                // add it to Houston.
                rulesets = [].concat(rulesets);
                houston.addRulesetSync(rulesets);
            }
        };

        /**
         * Splits a file into its file name and file extension.
         * @param {String} file the file
         * @return {String[]} the parts of the file in array form
         *                    (The first element is the file name.
         *                     The second element is the file extension.)
         */
        splitFileExt = function(file) {
            /*      *\
            | locals |
            \*      */
            // the very last index of '.' in the file
            var lastIndexOfDot;
            /*          *\
            | end locals |
            \*          */
            // Grab the very last index of '.' in the file.
            lastIndexOfDot = file.lastIndexOf('.');

            // Return the parts of the file in array form.
            // (The first element is the file name.
            //  The second element is the file extension.)
            return [
                file.slice(0, lastIndexOfDot),
                file.slice(lastIndexOfDot)
            ];
        };

        /**
         * Converts a file name to a proper module name.
         * Removes all '_' characters from the file name and converts it to
         * upper-cased camel-case.
         * @param {String} fileName the file name
         * @return {String} the proper module name
         */
        convertFileNameToModuleName = function(fileName) {
            /*      *\
            | locals |
            \*      */
            // the module name
            var moduleName;
            /*          *\
            | end locals |
            \*          */
            // Remove all '_' characters from the file name and convert it to
            // upper-cased camel-case.
            moduleName = fileName.replace(
                /(\_[a-z])/g,
                function($1) {
                    return $1.toUpperCase().replace('_', '');
                }
            );
            moduleName = moduleName.charAt(0).toUpperCase() +
                         moduleName.slice(1);

            return moduleName;
        };

        /*            *\
        | end closures |
        \*            */

        // Safeguard against falsey parameters.
        if (!modulePaths) {
            throw 'no module paths';
        }
        if (!rulesetPaths) {
            throw 'no ruleset paths';
        }
        // Coerce the path variables into arrays.
        modulePaths = [].concat(modulePaths);
        rulesetPaths = [].concat(rulesetPaths);
        // If no dependency dictionary, create an empty dependency dictionary.
        dependencies = dependencies || {};
        // Start collecting module names and start the module dictionary.
        moduleNames = [];
        modules = {};
        // Create the Houston object and the dependency injection container.
        houston = createHouston();
        container = dependable.container();
        // Grab the logger from the dependencies.
        // If no logger, just use the console instead.
        logger = dependencies.logger || console;
        // Register the dependencies with the dependency injection container.
        container.register(dependencies);
        // Load the paths.
        loadModulePaths(modulePaths);
        loadRulesetPaths(rulesetPaths);

        return houston;
    }

    /*           *\
    | end methods |
    \*           */

};

/*                                     *\
| end creation of HoustonFactory object |
\*                                     */

/*       *\
| exports |
\*       */

module.exports = HoustonFactory;

/*           *\
| end exports |
\*           */

/*                             *\
| simple test of HoustonFactory |
\*                             */

/*
var hf = HoustonFactory;
var houston = hf.createHouston('./parsers', './rulesets', {
    models: {},
    io: {},
    services: {},
    logger: console
});
houston.trigger('onTwitter', 'twitter');
houston.trigger('onRSS', 'RSS');
*/

/*                                 *\
| end simple test of HoustonFactory |
\*                                 */
