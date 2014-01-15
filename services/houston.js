/**
 * @fileOverview Houston is a composable event engine for mediating the
 *               interactions between JavaScript modules.
 * @author Next Century Corporation
 * @version 0.0.7
 *
 * @example
 * // In node.js land...
 * var Houston = require('houston');
 * var houston = Houston();
 * // Or more simply...
 * var houston = require('houston')();
 *
 * @example
 * // In browser land...
 * var houston = Houston();
 *
 * @example
 * // Adding a module...
 * houston.addModule('ExampleModule', {
 *     exampleMethod: function(event) {
 *         // An event has 4 properties.
 *         // (1) the event name
 *         console.log(event.eventName);
 *         // (2) the event data
 *         console.log(event.eventData);
 *         // (3) the previous event names
 *         console.log(event.eventNameStack);
 *         // (4) the previous actions
 *         console.log(event.actionStack);
 *         // An event also has a chainable method called trigger
 *         // for triggering additional events.
 *         event.trigger('exampleEvent', {
 *             message: 'Hello, Houston!'
 *         });
 *     }
 * }, function(error) {
 *     if (error) {
 *         console.log('Failed to add module: ' + error);
 *     }
 *     else {
 *         console.log('Successfully added module!');
 *     }
 * });
 *
 * @example
 * // Adding a ruleset...
 * houston.addRuleset(
 *     'exampleEvent: {' +
 *         'ExampleModule.exampleMethod;' +
 *     '}',
 *     function(error) {
 *         if (error) {
 *             console.log('Failed to add HRS string: ' + error);
 *         }
 *         else {
 *             console.log('Successfully added HRS string!');
 *         }
 *     }
 * );
 *
 * @example
 * // Triggering an event...
 * houston.trigger('exampleEvent', {
 *     message: 'Hello, Houston!'
 * }, function(error, event) {
 *     console.log('Failed to propagate event: ' + error);
 *     console.log('The current event object is: ' + event);
 * });
 *
 * @example
 * // Manually parsing an HRS string...
 * var jsonRulesetDictionaries = Houston.parse(
 *     'exampleEvent {' +
 *         'ExampleModule.exampleMethod;' +
 *     '}'
 * );
 */

/*                  *\
| protective closure |
\*                  */

;(function() {

    /*      *\
    | locals |
    \*      */

    // the global object
    // (AKA "global" in node.js land)
    // (AKA "window" in browser land)
    var global;
    // a node.js and browser compatible wrapper for setTimeout of 0
    var setTimeoutOfZero;
    // the factory function
    var Houston;

    /*          *\
    | end locals |
    \*          */

    /*      *\
    | set up |
    \*      */

    // Save the global object.
    global = this;
    // We are in node.js land?
    if (typeof process !== 'undefined' && process.nextTick) {
        // Alias the process.nextTick function.
        setTimeoutOfZero = process.nextTick;
    }
    // Else, we are in browser land?
    else {
        // Wrap the setTimeout function.
        setTimeoutOfZero = function(fn) {
            setTimeout(fn, 0);
        };
    }

    /*          *\
    | end set up |
    \*          */

    /*                *\
    | factory function |
    \*                */

    /**
     * the static utility functions attached to the [Houston]{@link Houston}
     * factory function
     * @name HoustonStatic
     * @namespace
     */
    /**
     * The Houston factory function.
     * Creates a Houston object.
     * @function Houston
     * @static
     * @returns {HoustonObject} a Houston object
     *
     * @example
     * // NOTE: No need to use the "new" keyword.
     * // This is a simple factory function, not a complicated constructor.
     * var houston = Houston();
     */
    Houston = function() {
        /*      *\
        | locals |
        \*      */

        // the Houston object
        var HoustonObject;

        /*          *\
        | end locals |
        \*          */

        /*              *\
        | Houston object |
        \*              */

        /**
         * an instance of Houston
         * @name HoustonObject
         * @class
         */
        HoustonObject = {

            /*                *\
            | member variables |
            \*                */

            /**
             * the module dictionary which holds all the modules
             * (<strong>Directly modify this member variable
             *  at your own peril!</strong>)
             * @name modules
             * @memberof HoustonObject
             * @instance
             * @type {Object}
             */
            modules: {},
            /**
             * the ruleset dictionary which holds all the rules
             * (<strong>Directly modify this member variable
             *  at your own peril!</strong>)
             * @name ruleset
             * @memberof HoustonObject
             * @instance
             * @type {Object}
             */
            ruleset: {},

            /*                    *\
            | end member variables |
            \*                    */

            /*       *\
            | methods |
            \*       */

            /**
             * The callback function for the
             * [HoustonObject.addModule]{@link HoustonObject#addModule}
             * method.
             * @callback houstonAddModuleCallback
             * @param {Error|undefined} error the error
             *                                <strong>OR</strong>
             *                                undefined if successful
             */
            /**
             * Asynchronously adds a single module
             * <strong>OR</strong>
             * an entire module dictionary to Houston.
             * If successful, this function will pass nothing to the callback.
             * If unsuccessful, this function will pass the error to
             * the callback.
             * If no callback is provided, this function will execute silently.
             * @function addModule
             * @memberof HoustonObject
             * @instance
             * @param {String|Object} moduleName the module name
             *                                   <strong>OR</strong>
             *                                   the module dictionary
             * @param {Object} [moduleObject] the module object (optional)
             * @param {houstonAddModuleCallback} [callback] the callback
             *                                              function (optional)
             * @returns {HoustonObject} the Houston object for method chaining
             *
             * @example
             * // Add a module.
             * houston.addModule('ExampleModule', {
             *     exampleMethod: function(event) {
             *         // An event has 4 properties.
             *         // (1) the event name
             *         console.log(event.eventName);
             *         // (2) the event data
             *         console.log(event.eventData);
             *         // (3) the previous event names
             *         console.log(event.eventNameStack);
             *         // (4) the previous actions
             *         console.log(event.actionStack);
             *         // An event also has a chainable method called trigger
             *         // for triggering additional events.
             *         event.trigger('exampleEvent', {
             *             message: 'Hello, Houston!'
             *         });
             *     }
             * }, function(error) {
             *     if (error) {
             *         console.log('Failed to add module: ' + error);
             *     }
             *     else {
             *         console.log('Successfully added module!');
             *     }
             * });
             *
             * @example
             * // Add a module dictionary.
             * houston.addModule({
             *     ExampleModule: {
             *         exampleMethod: function(event) {
             *             // An event has 4 properties.
             *             // (1) the event name
             *             console.log(event.eventName);
             *             // (2) the event data
             *             console.log(event.eventData);
             *             // (3) the previous event names
             *             console.log(event.eventNameStack);
             *             // (4) the previous actions
             *             console.log(event.actionStack);
             *             // An event also has a chainable method called trigger
             *             // for triggering additional events.
             *             event.trigger('exampleEvent', {
             *                 message: 'Hello, Houston!'
             *             });
             *         }
             *     }
             * }, function(error) {
             *     if (error) {
             *         console.log('Failed to add module dictionary: ' + error);
             *     }
             *     else {
             *         console.log('Successfully added module dictionary!');
             *     }
             * });
             */
            addModule: function(moduleName, moduleObject, callback) {
                /*      *\
                | locals |
                \*      */
                // whether we can call the callback function
                var canCallCallback;
                // the this pointer
                var me;
                /*          *\
                | end locals |
                \*          */
                // If the module object is a function,
                // assume the module object is the callback function.
                if (typeof(moduleObject) === 'function') {
                    callback = moduleObject;
                    moduleObject = undefined;
                }
                // Determine whether we can call the callback function.
                canCallCallback = typeof(callback) === 'function';
                // Save the this pointer.
                me = this;
                // Asynchronously...
                setTimeoutOfZero(function() {
                    // Here we go...
                    try {
                        // Call the synchronous version of this method.
                        me.addModuleSync(moduleName, moduleObject);
                        // Success!
                        if (canCallCallback) {
                            callback();
                        }
                    }
                    // Panic!
                    catch (e) {
                        // Error!
                        if (canCallCallback) {
                            callback(e);
                        }
                    }
                });

                // Support method chaining.
                return this;
            },

            /**
             * Synchronously adds a single module
             * <strong>OR</strong>
             * an entire module dictionary to Houston.
             * @function addModuleSync
             * @memberof HoustonObject
             * @instance
             * @param {String|Object} moduleName the module name
             *                                   <strong>OR</strong>
             *                                   the module dictionary
             * @param {Object} [moduleObject] the module object (optional)
             * @returns {HoustonObject} the Houston object for method chaining
             * @throws {Error} an error if
             *                 no module name provided,
             *                 no module object provided, or
             *                 no module dictionary provided
             *
             * @see [HoustonObject.addModule]{@link HoustonObject#addModule}
             *      for example code
             */
            addModuleSync: function(moduleName, moduleObject) {
                /*      *\
                | locals |
                \*      */
                // the new module dictionary
                var newModules;
                // the new module name
                var newModuleName;
                // the new module object
                var newModuleObject;
                // the Houston module dictionary
                var houstonModules;
                /*          *\
                | end locals |
                \*          */
                // Module object?
                if (moduleObject) {
                    // Safeguard against falsey parameters.
                    if (!moduleName) {
                        throw new Error('no module name');
                    }
                    if (!moduleObject) {
                        throw new Error('no module object');
                    }
                    // Grab the Houston module dictionary and
                    // add the module to it.
                    houstonModules = this.modules;
                    houstonModules[moduleName] = moduleObject;
                }
                // Else?
                else {
                    // Assume the module name is a module dictionary.
                    newModules = moduleName;
                    // Safeguard against falsey parameters.
                    if (!newModules) {
                        throw new Error('no module dictionary');
                    }
                    // Loop through the new module dictionary.
                    for (newModuleName in newModules) {
                        if (newModules.hasOwnProperty(newModuleName)) {
                            newModuleObject = newModules[newModuleName];
                            // If no new module object, skip it!
                            if (!newModuleObject) {
                                continue;
                            }
                            // Register the new module.
                            //--------------------------------------------------
                            // NOTE: No need to worry about stack overflow.
                            // This will result in only one level of recursion.
                            //--------------------------------------------------
                            this.addModule(newModuleName, newModuleObject);
                        }
                    }
                }

                // Support method chaining.
                return this;
            },

            /**
             * Determines whether or not a module name is registered
             * with Houston.
             * @function hasModule
             * @memberof HoustonObject
             * @instance
             * @param {String} moduleName the module name
             * @returns {boolean} whether or not the module name is registered
             *                    with Houston
             */
            hasModule: function(moduleName) {
                return this.modules.hasOwnProperty(moduleName);
            },

            /**
             * Retrieves a module object registered with Houston.
             * @function getModule
             * @memberof HoustonObject
             * @instance
             * @param {String} moduleName the module name
             * @returns {Object|undefined} the module object
             *                             <strong>OR</strong>
             *                             undefined if Houston cannot find it
             */
            getModule: function(moduleName) {
                return this.modules[moduleName];
            },

            /**
             * Retrieves a dictionary of all the module objects
             * registered with Houston.
             * @function getAllModules
             * @memberof HoustonObject
             * @instance
             * @returns {Object} the dictionary of all the module objects
             *                   registered with Houston
             */
            getAllModules: function() {
                /*      *\
                | locals |
                \*      */
                // the Houston module dictionary
                var houstonModules;
                // a safe copy of the Houston module dictionary
                var allModules;
                // the current module name
                var moduleName;
                /*          *\
                | end locals |
                \*          */
                // Create a safe copy of the Houston module dictionary.
                houstonModules = this.modules;
                allModules = {};
                for (moduleName in houstonModules) {
                    if (houstonModules.hasOwnProperty(moduleName)) {
                        allModules[moduleName] = houstonModules[moduleName];
                    }
                }

                return allModules;
            },

            /**
             * Unregisters a module from Houston.
             * If the module name was never registered with Houston
             * in the first place, this function will effectively do nothing.
             * @function removeModule
             * @memberof HoustonObject
             * @instance
             * @param {String} moduleName the module name
             * @returns {HoustonObject} the Houston object for method chaining
             */
            removeModule: function(moduleName) {
                delete this.modules[moduleName];

                // Support method chaining.
                return this;
            },

            /**
             * Unregisters all the modules registered with Houston.
             * @function clearAllModules
             * @memberof HoustonObject
             * @instance
             * @returns {HoustonObject} the Houston object for method chaining
             */
            clearAllModules: function() {
                this.modules = {};

                // Support method chaining.
                return this;
            },

            /**
             * The callback function for the
             * [HoustonObject.addRuleset]{@link HoustonObject#addRuleset}
             * method.
             * @callback houstonAddRulesetCallback
             * @param {Error|undefined} error the error
             *                                <strong>OR</strong>
             *                                undefined if successful
             */
            /**
             * Asynchronously adds an HRS string
             * (see the [Houston.parse]{@link HoustonStatic.parse}
             *  static utility function)
             * <strong>OR</strong>
             * a ruleset dictionary
             * <strong>OR</strong>
             * an array of ruleset dictionaries
             * to the Houston ruleset dictionary.
             * If successful, this function will pass nothing to the callback.
             * If unsuccessful, this function will pass the error to
             * the callback.
             * If no callback is provided, this function will execute silently.
             * @function addRuleset
             * @memberof HoustonObject
             * @instance
             * @param {String|Object|Object[]} rulesets the HRS string
             *                                          <strong>OR</strong>
             *                                          the ruleset dictionary
             *                                          <strong>OR</strong>
             *                                          the array of ruleset
             *                                          dictionaries
             * @param {houstonAddRulesetCallback} [callback] the callback
             *                                               (optional)
             * @returns {HoustonObject} the Houston object for method chaining
             *
             * @example
             * // Add an HRS string.
             * houston.addRuleset(
             *     'exampleEvent: {' +
             *         'ExampleModule.exampleMethod;' +
             *     '}',
             *     function(error) {
             *         if (error) {
             *             console.log('Failed to add HRS string: ' + error);
             *         }
             *         else {
             *             console.log('Successfully added HRS string!');
             *         }
             *     }
             * );
             *
             * @example
             * // Add a ruleset dictionary.
             * houston.addRuleset({
             *     exampleEvent: {
             *         actions: [
             *             {
             *                 moduleName: 'ExampleModule',
             *                 methodName: 'exampleMethod'
             *             }
             *         ]
             *     }
             * }, function(error) {
             *     if (error) {
             *         console.log('Failed to add ruleset dictionary: ' + error);
             *     }
             *     else {
             *         console.log('Successfully added ruleset dictionary!');
             *     }
             * });
             *
             * @example
             * // Add an array of ruleset dictionaries.
             * houston.addRuleset([
             *     {
             *         exampleEvent: {
             *             actions: [
             *                 {
             *                     moduleName: 'ExampleModule',
             *                     methodName: 'exampleMethod'
             *                 }
             *             ]
             *         }
             *     }
             * ], function(error) {
             *     if (error) {
             *         console.log('Failed to add array of ruleset dictionaries: ' + error);
             *     }
             *     else {
             *         console.log('Successfully added array of ruleset dictionaries!');
             *     }
             * });
             */
            addRuleset: function(rulesets, callback) {
                /*      *\
                | locals |
                \*      */
                // whether we can call the callback function
                var canCallCallback;
                // the this pointer
                var me;
                /*          *\
                | end locals |
                \*          */
                // Determine whether we can call the callback function.
                canCallCallback = typeof(callback) === 'function';
                // Save the this pointer.
                me = this;
                // Asynchronously...
                setTimeoutOfZero(function() {
                    // Here we go...
                    try {
                        // Call the synchronous version of this method.
                        me.addRulesetSync(rulesets);
                        // Success!
                        if (canCallCallback) {
                            callback();
                        }
                    }
                    // Panic!
                    catch (e) {
                        // Error!
                        if (canCallCallback) {
                            callback(e);
                        }
                    }
                });

                // Support method chaining.
                return this;
            },

            /**
             * Synchronously adds an HRS string
             * (see the [Houston.parse]{@link HoustonStatic.parse}
             *  static utility function)
             * <strong>OR</strong>
             * a ruleset dictionary
             * <strong>OR</strong>
             * an array of ruleset dictionaries
             * to the Houston ruleset dictionary.
             * @function addRulesetSync
             * @memberof HoustonObject
             * @instance
             * @param {String|Object|Object[]} rulesets the HRS string
             *                                          <strong>OR</strong>
             *                                          the ruleset dictionary
             *                                          <strong>OR</strong>
             *                                          the array of ruleset
             *                                          dictionaries
             * @returns {HoustonObject} the Houston object for method chaining
             * @throws {Error} an error if no rulesets provided
             *
             * @see [HoustonObject.addRuleset]{@link HoustonObject#addRuleset}
             *      for example code
             */
            addRulesetSync: function(rulesets) {
                /*      *\
                | locals |
                \*      */

                // the Houston ruleset dictionary
                var houstonRuleset;
                // the number of rulesets
                var numRulesets;
                // loop variables
                var i;
                // the current ruleset
                var ruleset;
                // the closures
                var mergeRulesets;
                var areSameAction;

                /*          *\
                | end locals |
                \*          */

                /*        *\
                | closures |
                \*        */

                /**
                 * Merges a new ruleset dictionary into a master
                 * ruleset dictionary.
                 * Beware, this function calls itself.
                 * @param {Object} masterRuleset the master ruleset dictionary
                 *                               (written to)
                 * @param {Object} newRuleset the new ruleset dictionary
                 *                            (read from)
                 */
                mergeRulesets = function(masterRuleset, newRuleset) {
                    /*      *\
                    | locals |
                    \*      */
                    // the current event name
                    var eventName;
                    // the ruleset for the current event in the new ruleset
                    var newRulesetForEvent;
                    // the ruleset for the current event in the master ruleset
                    var masterRulesetForEvent;
                    // the actions from the new ruleset
                    var newActions;
                    // the actions from the master ruleset
                    var masterActions;
                    // the number of actions from the new ruleset
                    var numNewActions;
                    // the number of actions from the master ruleset
                    var numMasterActions;
                    // loop variable
                    var i;
                    // the current action from the new ruleset
                    var newAction;
                    // loop variable
                    var j;
                    // the current action from the master ruleset
                    var masterAction;
                    // whether the current action from the new ruleset is
                    // a duplicate of the current action from the master ruleset
                    var duplicateAction;
                    // the previous events for the new ruleset
                    var newPreviousEvents;
                    // the previous events for the master ruleset
                    var masterPreviousEvents;
                    /*          *\
                    | end locals |
                    \*          */
                    // Loop through the events in the new ruleset using
                    // the for-in-has-own-property trick.
                    for (eventName in newRuleset) {
                        if (newRuleset.hasOwnProperty(eventName)) {
                            // Grab the new ruleset for the event.
                            newRulesetForEvent = newRuleset[eventName];
                            // The event is already defined
                            // in the master ruleset?
                            if (masterRuleset.hasOwnProperty(eventName)) {
                                // Grab the master ruleset for the event.
                                masterRulesetForEvent =
                                    masterRuleset[eventName];
                                //----------------------------------------------
                                // Merge the new actions into the master rules.
                                //----------------------------------------------
                                // Grab the new and master actions.
                                newActions = newRulesetForEvent.actions;
                                masterActions = masterRulesetForEvent.actions;
                                // There are new actions?
                                if (newActions) {
                                    // Default the master actions to
                                    // an empty array.
                                    if (!masterActions) {
                                        masterActions = [];
                                        masterRulesetForEvent.actions =
                                            masterActions;
                                    }
                                    // Grab the number of new actions and
                                    // the number of master actions.
                                    numNewActions = newActions.length;
                                    numMasterActions = masterActions.length;
                                    // Loop through the new actions.
                                    for (i = 0; i < numNewActions; i++) {
                                        newAction = newActions[i];
                                        // Start out by assuming that
                                        // the new action is not a duplicate
                                        // of the master action.
                                        duplicateAction = false;
                                        // Loop through the master actions.
                                        for (j = 0; j < numMasterActions; j++) {
                                            masterAction = masterActions[j];
                                            // Determine whether
                                            // the new action
                                            // is a duplicate of
                                            // the master action.
                                            // If duplicate, stop looping!
                                            duplicateAction = areSameAction(
                                                masterAction,
                                                newAction
                                            );
                                            if (duplicateAction) {
                                                break;
                                            }
                                        }
                                        // Add the new action to the master
                                        // actions only if it's not a
                                        // duplicate.
                                        if (!duplicateAction) {
                                            masterActions.push(newAction);
                                        }
                                    }
                                }
                                //------------------------------------
                                // Merge the new previous events into
                                // the master events.
                                //------------------------------------
                                // Grab the new and master previous events.
                                newPreviousEvents =
                                    newRulesetForEvent.previousEvents;
                                masterPreviousEvents =
                                    masterRulesetForEvent.previousEvents;
                                // If needed, recursively merge the new
                                // previous events into the master events.
                                if (newPreviousEvents) {
                                    mergeRulesets(
                                        masterPreviousEvents,
                                        newPreviousEvents
                                    );
                                }
                            }
                            // Else?
                            else {
                                // Add the new event to the master ruleset.
                                masterRuleset[eventName] = newRulesetForEvent;
                            }
                        }
                    }
                };

                /**
                 * Determines whether or not two actions are the same action.
                 * @param {Object} firstAction the first action
                 * @param {String} firstAction.moduleName the module name for
                 *                                        the first action
                 * @param {String} firstAction.methodName the method name for
                 *                                        the first action
                 * @param {Object} secondAction the second action
                 * @param {String} secondAction.moduleName the module name for
                 *                                         the second action
                 * @param {String} secondAction.methodName the method name for
                 *                                         the second action
                 * @return {boolean} whether or not the two actions are
                 *                   the same action
                 */
                areSameAction = function(firstAction, secondAction) {
                    return firstAction.moduleName === secondAction.moduleName &&
                           firstAction.methodName === secondAction.methodName;
                };

                /*            *\
                | end closures |
                \*            */

                // Grab the Houston ruleset dictionary.
                houstonRuleset = this.ruleset;
                // If the rulesets variable is falsey, panic!
                if (!rulesets) {
                    throw new Error('no rulesets');
                }
                // If the rulesets variable is a string,
                // parse it using Houston.parse.
                if (typeof rulesets === 'string') {
                    rulesets = Houston.parse(rulesets);
                }
                // Else, coerce the rulesets variable into an array.
                else {
                    rulesets = [].concat(rulesets);
                }
                // Loop through the ruleset dictionaries.
                numRulesets = rulesets.length;
                for (i = 0; i < numRulesets; i++) {
                    ruleset = rulesets[i];
                    // Recursively merge the ruleset dictionary into
                    // the Houston ruleset dictionary.
                    mergeRulesets(houstonRuleset, ruleset);
                }

                // Support method chaining.
                return this;
            },

            /**
             * Retrieves the Houston ruleset dictionary.
             * @function getAllRulesets
             * @memberof HoustonObject
             * @instance
             * @returns {Object} the Houston ruleset dictionary
             */
            getAllRulesets: function() {
                /*      *\
                | locals |
                \*      */
                // the Houston ruleset dictionary
                var houstonRuleset;
                // a safe copy of the Houston ruleset dictionary
                var allRuleset;
                // the current event name
                var eventName;
                /*          *\
                | end locals |
                \*          */
                // Create a safe copy of the Houston ruleset dictionary.
                houstonRuleset = this.ruleset;
                allRuleset = {};
                for (eventName in houstonRuleset) {
                    if (houstonRuleset.hasOwnProperty(eventName)) {
                        allRuleset[eventName] = houstonRuleset[eventName];
                    }
                }

                return allRuleset;
            },

            /**
             * Clears the Houston ruleset dictionary.
             * @function clearAllRulesets
             * @memberof HoustonObject
             * @instance
             * @returns {HoustonObject} the Houston object for method chaining
             */
            clearAllRulesets: function() {
                this.ruleset = {};

                // Support method chaining.
                return this;
            },

            /**
             * The callback function for the
             * [HoustonObject.trigger]{@link HoustonObject#trigger}
             * method.
             * @callback houstonTriggerCallback
             * @param {Error} error the error
             * @param {Object} event the event
             * @param {String} event.eventName the event name
             * @param {Object} event.eventData the event data
             * @param {String[]} event.eventNameStack the previous events
             * @param {Object[]} event.actionStack the previous actions
             * @param {String} event.actionStack[].moduleName the module
             *                                                name of the
             *                                                action
             * @param {String} event.actionStack[].methodName the method
             *                                                name of the
             *                                                action
             * @param {number} event.actionStack[].startTime when the action
             *                                               started
             *                                               (in
             *                                                milliseconds
             *                                                since the UNIX
             *                                                Epoch)
             * @param {number} event.actionStack[].endTime when the action
             *                                             triggered a new
             *                                             event
             *                                             (in
             *                                              milliseconds
             *                                              since the UNIX
             *                                              Epoch)
             */
            /**
             * Asynchronously triggers an event and propagates it based upon
             * Houston's modules and ruleset.
             * If successful, this function never calls the callback because
             * it is impossible to know for sure when a chain of events
             * is over.
             * If unsuccessful, this function passes the error to the callback.
             * If no callback is provided, this function executes silently.
             * @function trigger
             * @memberof HoustonObject
             * @instance
             * @param {String} eventName the event name
             * @param {Object} eventData the event data
             * @param {String[]} [eventNameStack] fake previous events
             *                                    (optional)
             * @param {houstonTriggerCallback} [callback] the callback
             *                                            (optional)
             * @returns {HoustonObject} the Houston object for method chaining
             *
             * @example
             * // Trigger an event.
             * houston.trigger('exampleEvent', {
             *     message: 'Hello, Houston!'
             * }, function(error, event) {
             *     console.log('Failed to propagate event: ' + error);
             *     console.log('The current event object is: ' + event);
             * });
             */
            trigger: function(eventName, eventData, eventNameStack, callback) {
                /*      *\
                | locals |
                \*      */

                // the action stack
                var actionStack;
                // whether we can call the callback function
                var canCallCallback;
                // the module dictionary
                var modules;
                // the ruleset dictionary
                var ruleset;
                // the closures
                var propagate;
                var evaluateActions;
                var evaluateAction;
                var evaluatePreviousEvents;

                /*          *\
                | end locals |
                \*          */

                /*        *\
                | closures |
                \*        */

                //-------------------------------------------------------------
                // CLOSURE EXECUTION FLOW:
                //-------------------------------------------------------------
                // - Propagate the very first event.
                //   - If needed, asynchronously evaluate the actions.
                //     - Asynchronously evaluate each action.
                //       - Propagate any additional events.
                //   - If needed, asynchronously evaluate the previous events.
                //     - Recursively evaluate the previous events.
                //       - If needed, evaluate the actions.
                //         - Asynchronously evaluate each action.
                //           - Propagate any additional events.
                //-------------------------------------------------------------

                /**
                 * Asynchronously propagates an event.
                 * @param {Object} event the event
                 * @param {String} event.eventName the event name
                 * @param {Object} event.eventData the event data
                 * @param {String[]} event.eventNameStack the previous events
                 * @param {Object[]} event.actionStack the previous actions
                 * @param {String} event.actionStack[].moduleName the module
                 *                                                name of the
                 *                                                action
                 * @param {String} event.actionStack[].methodName the method
                 *                                                name of the
                 *                                                action
                 * @param {number} event.actionStack[].startTime when the action
                 *                                               started
                 *                                               (in
                 *                                                milliseconds
                 *                                                since the UNIX
                 *                                                Epoch)
                 * @param {number} event.actionStack[].endTime when the action
                 *                                             triggered a new
                 *                                             event
                 *                                             (in
                 *                                              milliseconds
                 *                                              since the UNIX
                 *                                              Epoch)
                 */
                propagate = function(event) {
                    /*      *\
                    | locals |
                    \*      */
                    // the name of the event
                    var eventName;
                    // the ruleset for the event in the ruleset dictionary
                    var rulesetForEvent;
                    // the actions from the ruleset
                    var actionsFromRuleset;
                    // the previous events from the ruleset
                    var previousEventsFromRuleset;
                    /*          *\
                    | end locals |
                    \*          */
                    // Grab the event name and look it up in the ruleset
                    // dictionary.
                    // If we can't find anything, stop here!
                    eventName = event.eventName;
                    rulesetForEvent = ruleset[eventName];
                    if (!rulesetForEvent) {
                        return;
                    }
                    // From the ruleset for the event,
                    // grab the actions and the previous events.
                    actionsFromRuleset = rulesetForEvent.actions;
                    previousEventsFromRuleset = rulesetForEvent.previousEvents;
                    // If needed, asynchronously evaluate
                    // the actions and the previous events.
                    if (actionsFromRuleset && actionsFromRuleset.length > 0) {
                        setTimeoutOfZero(function() {
                            evaluateActions(event, actionsFromRuleset);
                        });
                    }
                    if (previousEventsFromRuleset) {
                        setTimeoutOfZero(function() {
                            evaluatePreviousEvents(
                                event,
                                previousEventsFromRuleset,
                                0 // the stack offset must start at 0
                            );
                        });
                    }
                };

                /**
                 * Synchronously evaluates an array of actions.
                 * @param {Object} event the event
                 * @param {String} event.eventName the event name
                 * @param {Object} event.eventData the event data
                 * @param {String[]} event.eventNameStack the previous events
                 * @param {Object[]} event.actionStack the previous actions
                 * @param {String} event.actionStack[].moduleName the module
                 *                                                name of the
                 *                                                action
                 * @param {String} event.actionStack[].methodName the method
                 *                                                name of the
                 *                                                action
                 * @param {number} event.actionStack[].startTime when the action
                 *                                               started
                 *                                               (in
                 *                                                milliseconds
                 *                                                since the UNIX
                 *                                                Epoch)
                 * @param {number} event.actionStack[].endTime when the action
                 *                                             triggered a new
                 *                                             event
                 *                                             (in
                 *                                              milliseconds
                 *                                              since the UNIX
                 *                                              Epoch)
                 * @param {Object[]} actions the actions
                 */
                evaluateActions = function(event, actions) {
                    /*      *\
                    | locals |
                    \*      */
                    // the number of actions
                    var numActions;
                    // loop variable
                    var i;
                    // the current action
                    var action;
                    /*          *\
                    | end locals |
                    \*          */
                    numActions = actions.length;
                    for (i = 0; i < numActions; i++) {
                        action = actions[i];
                        evaluateAction(event, action);
                    }
                };

                /**
                 * Asynchronously evaluates an action.
                 * @param {Object} event the event
                 * @param {String} event.eventName the event name
                 * @param {Object} event.eventData the event data
                 * @param {String[]} event.eventNameStack the previous events
                 * @param {Object[]} event.actionStack the previous actions
                 * @param {String} event.actionStack[].moduleName the module
                 *                                                name of the
                 *                                                action
                 * @param {String} event.actionStack[].methodName the method
                 *                                                name of the
                 *                                                action
                 * @param {number} event.actionStack[].startTime when the action
                 *                                               started
                 *                                               (in
                 *                                                milliseconds
                 *                                                since the UNIX
                 *                                                Epoch)
                 * @param {number} event.actionStack[].endTime when the action
                 *                                             triggered a new
                 *                                             event
                 *                                             (in
                 *                                              milliseconds
                 *                                              since the UNIX
                 *                                              Epoch)
                 * @param {Object} action the action
                 * @param {String} action.module the module name
                 * @param {String} action.method the method name
                 */
                evaluateAction = function(event, action) {
                    /*      *\
                    | locals |
                    \*      */
                    // the name of the event
                    var eventName;
                    // the event data
                    var eventData;
                    // the previous event names
                    var eventNameStack;
                    // the previous actions
                    var actionStack;
                    // the module name
                    var moduleName;
                    // the module
                    var module;
                    // the method name
                    var methodName;
                    // the method
                    var method;
                    /*          *\
                    | end locals |
                    \*          */
                    // Grab the event name, event data, event name stack, and
                    // action stack.
                    eventName = event.eventName;
                    eventData = event.eventData;
                    eventNameStack = event.eventNameStack;
                    actionStack = event.actionStack;
                    // Grab the module name and look it up in the module
                    // dictionary.
                    // If we can't find anything, panic and stop!
                    moduleName = action.moduleName;
                    module = modules[moduleName];
                    if (!module) {
                        // Panic!
                        if (canCallCallback) {
                            callback(new Error(
                                'Houston cannot find module "' + moduleName + '"'
                            ), event);
                        }
                        // Stop!
                        return;
                    }
                    // Grab the method name and look it up in the module.
                    // If we can't find anything, panic and stop!
                    methodName = action.methodName;
                    method = module[methodName];
                    if (!method || typeof(method) !== 'function') {
                        // Panic!
                        if (canCallCallback) {
                            callback(new Error(
                                'Houston cannot find method "' + moduleName +
                                '.' + methodName + '"'
                            ), event);
                        }
                        // Stop!
                        return;
                    }
                    // Asynchronously...
                    setTimeoutOfZero(function() {
                        /*      *\
                        | locals |
                        \*      */
                        // the start time of the method call
                        // in milliseconds since UNIX
                        var startTime;
                        /*          *\
                        | end locals |
                        \*          */
                        // Grab the start time.
                        startTime = Date.now();
                        // Here we go...
                        try {
                            // Call the method.
                            // Make sure the module is the "this" pointer of
                            // the method call.
                            // Pass a safe copy of the event object to the
                            // method.
                            // Add an extra chainable trigger method to the
                            // event object
                            // so that the method can trigger additional events.
                            method.call(module, {
                                eventName: eventName,
                                eventData: eventData,
                                eventNameStack: eventNameStack.slice(),
                                actionStack: actionStack.slice(),
                                trigger: function(newEventName, newEventData) {
                                    /*      *\
                                    | locals |
                                    \*      */
                                    // the end time of the method call
                                    // in milliseconds since UNIX
                                    var endTime;
                                    /*          *\
                                    | end locals |
                                    \*          */
                                    // Grab the end time.
                                    endTime = Date.now();
                                    // Asynchronously propagate the new event.
                                    propagate({
                                        eventName: newEventName,
                                        eventData: newEventData,
                                        eventNameStack:
                                            eventNameStack.concat(eventName),
                                        actionStack: actionStack.concat({
                                            moduleName: moduleName,
                                            methodName: methodName,
                                            startTime: startTime,
                                            endTime: endTime
                                        })
                                    });

                                    // Support method chaining.
                                    return this;
                                }
                            });
                        }
                        // Panic!
                        catch (e) {
                            // Panic!
                            if (canCallCallback) {
                                callback(e, event);
                            }
                            // Stop!
                            return;
                        }
                    });
                };

                /**
                 * Evaluates a dictionary of previous events.
                 * @param {Object} event the event
                 * @param {String} event.eventName the event name
                 * @param {Object} event.eventData the event data
                 * @param {String[]} event.eventNameStack the previous events
                 * @param {Object[]} event.actionStack the previous actions
                 * @param {String} event.actionStack[].moduleName the module
                 *                                                name of the
                 *                                                action
                 * @param {String} event.actionStack[].methodName the method
                 *                                                name of the
                 *                                                action
                 * @param {number} event.actionStack[].startTime when the action
                 *                                               started
                 *                                               (in
                 *                                                milliseconds
                 *                                                since the UNIX
                 *                                                Epoch)
                 * @param {number} event.actionStack[].endTime when the action
                 *                                             triggered a new
                 *                                             event
                 *                                             (in
                 *                                              milliseconds
                 *                                              since the UNIX
                 *                                              Epoch)
                 * @param {Object} previousEvents This is a recursive dictionary
                 *                                which holds actions which
                 *                                should only be evaluated after
                 *                                a specific sequence of events
                 *                                has occurred.
                 * @param {number} stackOffset This is an integer offset from
                 *                             the last event in the event name
                 *                             stack.
                 *                             It must start at 0 and increase
                 *                             with each recursive call.
                 */
                evaluatePreviousEvents = function(event, previousEvents, stackOffset) {
                    /*      *\
                    | locals |
                    \*      */
                    // the name of the event
                    var eventName;
                    // the previous event names
                    var eventNameStack;
                    // the number of previous event names
                    var numEventNames;
                    // the index into the array of previous event names
                    var i;
                    // the current previous event name
                    var previousEventName;
                    // the ruleset for the previous event
                    var rulesetForPreviousEvent;
                    // the actions from the ruleset
                    var actionsFromRuleset;
                    // the previous events from the ruleset
                    var previousEventsFromRuleset;
                    /*          *\
                    | end locals |
                    \*          */
                    // Grab the event name, the event name stack, and
                    // the number of previous event names.
                    eventName = event.eventName;
                    eventNameStack = event.eventNameStack;
                    numEventNames = eventNameStack.length;
                    // Start the index at the last event name minus the stack
                    // offset and loop it down to 0.
                    i = numEventNames - 1 - stackOffset;
                    while (i >= 0) {
                        // Grab the current previous event name and check
                        // whether the current previous event name is one of
                        // the previous events we are looking for.
                        previousEventName = eventNameStack[i];
                        if (previousEvents.hasOwnProperty(previousEventName)) {
                            // Grab the ruleset for the previous event,
                            // the actions, and the previous events.
                            rulesetForPreviousEvent =
                                previousEvents[previousEventName];
                            actionsFromRuleset =
                                rulesetForPreviousEvent.actions;
                            previousEventsFromRuleset =
                                rulesetForPreviousEvent.previousEvents;
                            // If needed, evaluate the rules and
                            // the previous events.
                            // Make sure to update the stack offset.
                            // The stack offset should equal
                            // the number of previous event names minus
                            // the index.
                            if (
                                actionsFromRuleset &&
                                actionsFromRuleset.length > 0
                            ) {
                                evaluateActions(event, actionsFromRuleset);
                            }
                            if (previousEventsFromRuleset) {
                                evaluatePreviousEvents(
                                    event,
                                    previousEventsFromRuleset,
                                    numEventNames - i
                                );
                            }
                        }
                        // Update the index.
                        i--;
                    }
                };

                /*            *\
                | end closures |
                \*            */

                // Safeguard against falsey parameters.
                if (!eventName) {
                    throw new Error('no event name');
                }
                // Default the event name stack to an empty array.
                eventNameStack = eventNameStack || [];
                // If event name stack is a function,
                // assume the event name stack is the callback function.
                if (typeof(eventNameStack) === 'function') {
                    callback = eventNameStack;
                    eventNameStack = [];
                }
                // Else, coerce the event name stack to an array.
                else {
                    eventNameStack = [].concat(eventNameStack);
                }
                // The action stack array and the event name stack array
                // must be kept in parallel.
                // Since we have no way of knowing what actions happened
                // alongside fake event names, we must fill the action stack
                // with as many nulls as there are fake event names in
                // the event name stack.
                actionStack = eventNameStack.map(function() {
                    return null;
                });
                // Determine whether we can call the callback function.
                canCallCallback = typeof(callback) === 'function';
                // Grab the module dictionary and the ruleset dictionary.
                modules = this.modules;
                ruleset = this.ruleset;
                // Asynchronously propagate the event.
                propagate({
                    eventName: eventName,
                    eventData: eventData,
                    eventNameStack: eventNameStack,
                    actionStack: actionStack
                });

                // Support method chaining.
                return this;
            }

            /*           *\
            | end methods |
            \*           */

        };

        /*                  *\
        | end Houston object |
        \*                  */

        return HoustonObject;
    };

    /*                    *\
    | end factory function |
    \*                    */

    /*              *\
    | parse function |
    \*              */

    /**
     * Lexes and parses the Houston Ruleset (HRS)
     * domain-specific language (DSL).
     * HRS is a convenient web-developer-friendly representation
     * of Houston's ruleset dictionary inspired by
     * Cascading Stylesheets (CSS).
     * Houston's ruleset dictionary is optimized for performance,
     * not human readability.
     * Although it can be easily represented in JSON format,
     * it can often become confusingly recursive and overly verbose.
     * HRS is a higher-level language which sits on top of the
     * lower-level ruleset dictionary.
     * Each HRS rule is compiled into a separate ruleset dictionary.
     * The resulting ruleset dictionaries can then be immediately
     * added to Houston or stringified into a JSON array.
     * @function parse
     * @memberof HoustonStatic
     * @param {String} input the HRS input string
     * @returns {Object[]} an array of ruleset dictionaries
     * @throws {Error} an error if
     *                 no input provided or
     *                 unable to lex or parse the input string
     *
     * @example
     * //--------------------
     * // JavaScript EXAMPLE
     * //--------------------
     * // Parse an HRS string.
     * var jsonRulesetDictionaries = Houston.parse(
     *     'exampleEvent {' +
     *         'ExampleModule.exampleMethod;' +
     *     '}'
     * );
     *
     * @example
     * //-------------
     * // HRS EXAMPLE
     * //-------------
     * // The identifiers before the "{" are called "event selectors".
     * // Like CSS selectors in web browsers, event selectors are evaluated
     * // from right to left.
     * // Houston will first check if eventC happened.
     * // Next, Houston will check the history of eventC to see
     * // if eventB happened before eventC.
     * // Finally, Houston will check check the history of eventC to see
     * // if eventA happened before eventB.
     * // If all of these conditions are met,
     * // Houston will execute all of the actions contained within
     * // the curly brackets.
     * // If you do not care about the event history,
     * // just use one event selector.
     * // If you need certain actions to occur only
     * // when a specific chain of events has occured,
     * // use multiple event selectors.
     * eventA eventB eventC {
     *     // The things between the "{" and "}" are called "actions".
     *     // Each action starts with a module name, continues with a ".",
     *     // continues with a method name, and stops with a ";".
     *     // You can think of an action like a method call without
     *     // any arguments or parentheses.
     *     // That is because the event object for the right-most event selector
     *     // is implicity passed as the first argument to the method call.
     *     ModuleA.doStuff;
     *     ModuleA.doMoreStuff;
     *     ModuleB.doStuff;
     *     ModuleB.doMoreStuff;
     *     ModuleC.doStuff;
     *     ModuleC.doMoreStuff;
     * }
     * // Like CSS selectors in web browsers, it is possible to combine
     * // event selectors using commas.
     * // For those familiar with boolean logic, this is similar to
     * // the OR operator.
     * // For those familar with set theory, this is similar to
     * // the union of two sets.
     * // When eventD or eventE occurs, Houston will execute all of the actions
     * // contained within the curly brackets.
     * // Keep in mind that this is really just a simplication of two HRS rules
     * // with the exact same actions.
     * eventD, eventE {
     *     ModuleA.doStuff;
     *     ModuleA.doMoreStuff;
     *     ModuleB.doStuff;
     *     ModuleB.doMoreStuff;
     *     ModuleC.doStuff;
     *     ModuleC.doMoreStuff;
     * }
     * //-------------------------------------------------------------------
     * // P.S. All of the code above, including the comments, is valid HRS.
     * // P.P.S. HRS supports both C++-style and C-style comments.
     * //-------------------------------------------------------------------
     */
    Houston.parse = function(input) {
        /*      *\
        | locals |
        \*      */

        // the closures
        var lexer;
        var parser;

        /*          *\
        | end locals |
        \*          */

        /*        *\
        | closures |
        \*        */

        /*
         * Lexes an HRS input string into an array of HRS tokens.
         * @param {String} input the HRS input string
         * @returns {Object[]} an array of HRS tokens
         * @throws {Error} an error message if unable to lex the input string
         */
        lexer = function(input) {
            /*         *\
            | constants |
            \*         */

            var OPERATOR_REGEX = /[,{};]/;
            var COMMENT_REGEX = /[\/\\*]/;
            var WHITESPACE_REGEX = /\s/;

            /*             *\
            | end constants |
            \*             */

            /*      *\
            | locals |
            \*      */

            // the length of the input string
            var inputLen;
            // the list of tokens
            // (The lexer transforms the input string into a list of tokens.)
            var tokens;
            // the current index into the input string
            var i;
            // the current character from the input string
            var c;
            // the comment start string
            var commentStart;
            // a temporary variable
            // (This is used to collect a string of indentifier characters.)
            var identifier;
            // the closures
            var advance;
            var addToken;
            var isWhiteSpace;
            var isOperator;
            var isComment;
            var isIdentifier;
            var panic;

            /*          *\
            | end locals |
            \*          */

            /*        *\
            | closures |
            \*        */

            /**
             * Advances to the next input character.
             * @returns {String} the next input character for convenience
             */
            advance = function() {
                // Update the input index.
                i++;
                // Update the input character.
                c = input[i];

                return c;
            };

            /**
             * Adds a token to the list of tokens.
             * @param {String} type the type of the token
             * @param {any} value the value of the token
             */
            addToken = function(type, value) {
                tokens.push({
                    type: type,
                    value: value
                });
            };

            /**
             * Determines whether or not a character is a whitespace character.
             * @param {String} c the character
             * @returns {boolean} whether or not a character is
             *                    a whitespace character
             */
            isWhiteSpace = function(c) {
                return WHITESPACE_REGEX.test(c);
            };

            /**
             * Determines whether or not a character is a comment character.
             * @param {String} c the character
             * @returns {boolean} whether or not the character is
             *                    a comment character
             */
            isComment = function(c) {
                return COMMENT_REGEX.test(c);
            };

            /**
             * Determines whether or not a character is an operator character.
             * @param {String} c the character
             * @returns {boolean} whether or not the character is
             *                    an operator character
             */
            isOperator = function(c) {
                return OPERATOR_REGEX.test(c);
            };

            /**
             * Determines whether or not a character is
             * an indentifier character.
             * @param {String} c the character
             * @returns {boolean} whether or not a character is
             *                    a indentifier character
             */
            isIdentifier = function(c) {
                return typeof(c) === 'string' &&
                       !isOperator(c) &&
                       !isComment(c) &&
                       !isWhiteSpace(c);
            };

            /**
             * Throws an error explaining what went wrong.
             * @throws {Error} an error explaining what went wrong
             */
            panic = function() {
                throw new Error(
                    'unrecognized token at input character ' + i +
                    ' of value "' + c + '"'
                );
            };

            /*            *\
            | end closures |
            \*            */

            // Grab the input length,
            // start collecting tokens, and
            // start the input index.
            inputLen = input.length;
            tokens = [];
            i = 0;
            // Loop through the input characters.
            while (i < inputLen) {
                c = input[i];
                // If whitespace, advance to the next input character.
                if (isWhiteSpace(c)) {
                    advance();
                }
                // Else, comment?
                else if (isComment(c)) {
                    // Grab the comment start string.
                    commentStart = c;
                    commentStart += advance();
                    // C++-style comment?
                    if (commentStart === '//') {
                        // Keep skipping characters
                        // until we hit a newline.
                        while (i < inputLen) {
                            if (advance() === '\n') {
                                // No need to advance past the '\n'
                                // because it's a whitespace character.
                                // Stop!
                                break;
                            }
                        }
                    }
                    // Else, C-style comment?
                    else if (commentStart === '/*') {
                        // Keep skipping characters
                        // until we hit a '*/'.
                        while (i < inputLen) {
                            if (advance() === '*' && advance() === '/') {
                                // Must advance past the '/'
                                // because it's a comment character.
                                advance();
                                // Stop!
                                break;
                            }
                        }
                    }
                    // Else, panic!
                    else {
                        panic();
                    }
                }
                // Else, if operator, add the token and
                // advance to the next input character.
                else if (isOperator(c)) {
                    addToken(c);
                    advance();
                }
                // Else, identifier?
                else if (isIdentifier(c)) {
                    // Continue grabbing characters
                    // until the identifier is over.
                    identifier = c;
                    while (isIdentifier(advance())) {
                        identifier += c;
                    }
                    // Add the token.
                    addToken('identifier', identifier);
                }
                // Else, panic!
                else {
                    panic();
                }
            }

            return tokens;
        };

        /*
         * Parses an array of HRS tokens into an array of ruleset
         * dictionaries.
         * @param {String} tokens the array of HRS tokens
         * @returns {Object[]} an array of ruleset dictionaries
         * @throws {Error} an error if unable to parse the input string
         */
        parser = function(tokens) {
            /*      *\
            | locals |
            \*      */

            // the ruleset dictionaries
            var rulesets;
            // the number of tokens
            var numTokens;
            // the current index into the array of tokens
            var i;
            // what kind of token we are currently expecting
            var expecting;
            // the current token from the array of tokens
            var token;
            // the number of event selector commas
            var numEventSelectorCommas;
            // the event selectors between commas for the current HRS rule
            var eventSelectorsBetweenCommas;
            // the actions for the current HRS rule
            var actions;
            // the module name and method name for the current HRS action
            var moduleNameAndMethodName;
            // the index of the dot for the current HRS action
            var dotIndex;
            // the module name for the current HRS action
            var moduleName;
            // the method name for the current HRS action
            var methodName;
            // loop variable
            var j;
            // the closures
            var advance;
            var expect;
            var isExpecting;
            var convertToRuleset;
            var panic;

            /*          *\
            | end locals |
            \*          */

            /*        *\
            | closures |
            \*        */

            /**
             * Advances to the next token.
             * @returns {String} the next token for convenience
             */
            advance = function() {
                // Update the token index.
                i++;
                // Update the current token.
                token = tokens[i];

                return token;
            };

            /**
             * Sets an expectation of what kind of token should be next.
             * @param {String} expectation what kind of token should be next
             * @returns {String} the expectation for convenience
             */
            expect = function(expectation) {
                expecting = expectation;

                return expectation;
            };

            /**
             * Determines whether or not we are expecting
             * a certain kind of token.
             * @param {String} expectation what kind of token
             * @returns {boolean} whether or not we are expecting
             *                    a certain kind of token
             */
            isExpecting = function(expectation) {
                return expecting === expectation;
            };

            /**
             * Converts an array of event selectors and an array of actions
             * into a ruleset dictionary.
             * Beware, this function calls itself.
             * @param {String[]} eventSelectors the array of event selectors
             * @param {Object[]} actions the array of actions
             * @returns {Object} the ruleset dictionary
             */
            convertToRuleset = function(eventSelectors, actions) {
                /*      *\
                | locals |
                \*      */
                // the number of event selectors
                var numEventSelectors;
                // the right-most event selector
                var rightmostEventSelector;
                // the ruleset dictionary
                var ruleset;
                /*          *\
                | end locals |
                \*          */
                // Grab the number of event selectors and
                // the right-most event selector.
                numEventSelectors = eventSelectors.length;
                rightmostEventSelector = eventSelectors[numEventSelectors - 1];
                // Start the ruleset dictionary.
                ruleset = {};
                // More than one event selector?
                if (eventSelectors.length > 1) {
                    // Recursively, update the ruleset dictionary.
                    ruleset[rightmostEventSelector] = {
                        previousEvents: convertToRuleset(
                            eventSelectors.slice(0, numEventSelectors - 1),
                            actions
                        )
                    };
                }
                // Else?
                else {
                    // Update the ruleset dictionary.
                    ruleset[rightmostEventSelector] = {
                        actions: actions
                    };
                }

                return ruleset;
            };

            /**
             * Throws an error explaining what went wrong.
             * @throws {Error} an error explaining what went wrong
             */
            panic = function() {
                throw new Error(
                    'unexpected "' + token.type +
                    '" token at ' + i +
                    ' of value "' + token.value + '"'
                );
            };

            /*            *\
            | end closures |
            \*            */

            // Start collecting ruleset dictionaries,
            // grab the number of tokens, and
            // start the token index.
            rulesets = [];
            numTokens = tokens.length;
            i = 0;
            // Reset the number of event selector commas and
            // the event selectors between commas for the current HRS rule.
            numEventSelectorCommas = 0;
            eventSelectorsBetweenCommas = [];
            eventSelectorsBetweenCommas[numEventSelectorCommas] = [];
            // Expect event selector tokens!
            expect('event selectors');
            // Loop through the tokens.
            while (i < numTokens) {
                token = tokens[i];
                // Expecting event selector tokens?
                if (isExpecting('event selectors')) {
                    // The token is an identifier?
                    if (token.type === 'identifier') {
                        // Grab all the event selectors.
                        while (token && token.type === 'identifier') {
                            eventSelectorsBetweenCommas[numEventSelectorCommas]
                                .push(token.value);
                            advance();
                        }
                        // Expect a "{" token!
                        expect('{');
                    }
                    // Else, panic!
                    else {
                        panic();
                    }
                }
                // Else, expecting a "{" token?
                else if (isExpecting('{')) {
                    // The token is a "{"?
                    if (token.type === '{') {
                        // Reset the actions for the current HRS rule.
                        actions = [];
                        // Advance to the next token.
                        advance();
                        // Expect a module name and method name token!
                        expect('module name and method name');
                    }
                    // Else, the token is a ","?
                    else if (token.type === ',') {
                        // Update the number of event selector commas and
                        // the event selectors between commas
                        // for the current HRS rule.
                        numEventSelectorCommas++;
                        eventSelectorsBetweenCommas[numEventSelectorCommas] = [];
                        // Advance to the next token.
                        advance();
                        // Expect event selector tokens!
                        expect('event selectors');
                    }
                    // Else, panic!
                    else {
                        panic();
                    }
                }
                // Else, expecting a module name and method name token?
                else if (isExpecting('module name and method name')) {
                    // The token is an identifier?
                    if (token.type === 'identifier') {
                        // Grab the module name and method name
                        // for the current HRS action.
                        moduleNameAndMethodName = token.value;
                        dotIndex = moduleNameAndMethodName.indexOf('.');
                        moduleName = moduleNameAndMethodName.slice(0, dotIndex);
                        methodName = moduleNameAndMethodName.slice(dotIndex + 1);
                        // Advance to the next token.
                        advance();
                        // Expect a ";" token!
                        expect(';');
                    }
                    // Else, the token is a "}"?
                    else if (token.type === '}') {
                        // Loop through the event selectors between commas.
                        for (j = 0; j <= numEventSelectorCommas; j++) {
                            // Convert the event selectors and actions into
                            // a ruleset dictionary and add it to the array
                            // of ruleset dictionaries.
                            // Make sure that each ruleset has a different
                            // copy of the actions.
                            rulesets.push(
                                convertToRuleset(
                                    eventSelectorsBetweenCommas[j],
                                    actions.slice()
                                )
                            );
                        }
                        // Reset the number of event selector commas and
                        // the event selectors between commas
                        // for the current HRS rule.
                        numEventSelectorCommas = 0;
                        eventSelectorsBetweenCommas = [];
                        eventSelectorsBetweenCommas[numEventSelectorCommas] = [];
                        // Advance to the next token.
                        advance();
                        // Expect event selector tokens.
                        expect('event selectors');
                    }
                    // Else, panic!
                    else {
                        panic();
                    }
                }
                // Else, expecting a ";" token?
                else if (isExpecting(';')) {
                    // The token is a ";"?
                    if (token.type === ';') {
                        // Add the current HRS action to
                        // the array of actions for the current HRS rule.
                        actions.push({
                            moduleName: moduleName,
                            methodName: methodName
                        });
                        // Advance to the next token.
                        advance();
                        // Expect a module name and method name token!
                        expect('module name and method name');
                    }
                    // Else, panic!
                    else {
                        panic();
                    }
                }
                // Else, panic!
                else {
                    panic();
                }
            }

            return rulesets;
        };

        /*            *\
        | end closures |
        \*            */

        // Safeguard against falsey parameters.
        if (!input) {
            throw new Error('no input');
        }

        // Lex and then parse the input string.
        // Return the output.
        return parser(lexer(input));
    };

    /*                  *\
    | end parse function |
    \*                  */

    /*       *\
    | exports |
    \*       */

    // We are in node.js land?
    if (
        typeof exports !== 'undefined' &&
        typeof module !== 'undefined' &&
        module.exports
    ) {
        // Export the factory function.
        exports = module.exports = Houston;
    }
    // Else, we are in browser land?
    else {
        // Export the factory function as a global variable.
        global.Houston = Houston;
    }

    /*           *\
    | end exports |
    \*           */

    /*                      *\
    | simple test of Houston |
    \*                      */

    /*
    var houston = Houston();

    houston.addModuleSync('Parser', {
        parse: function(event) {
            console.log('Entering Parser.parse');
            console.log(event);
            event.trigger('onParsed', event.eventData);
            console.log('Leaving Parser.parse');
        }
    });
    houston.addModuleSync('TwitterCounter', {
        count: function(event) {
            console.log('Entering TwitterCounter.count');
            console.log(event);
            event.trigger('onTwitterCounted', event.eventData);
            console.log('Leaving TwitterCounter.count');
        }
    });
    houston.addModuleSync('RSSCounter', {
        count: function(event) {
            console.log('Entering RSSCounter.count');
            console.log(event);
            event.trigger('onRSSCounted', event.eventData);
            console.log('Leaving RSSCounter.count');
        }
    });
    houston.addModuleSync('FinalTwitter', {
        final: function(event) {
            console.log('Entering FinalTwitter.final');
            console.log(event);
            console.log('Leaving FinalTwitter.final');
        }
    });

    houston.addRulesetSync({
        'onTwitter': {
            actions: [
                {
                    moduleName: 'Parser',
                    methodName: 'parse'
                }
            ]
        },
        'onRSS': {
            actions: [
                {
                    moduleName: 'Parser',
                    methodName: 'parse'
                }
            ]
        },
        'onParsed': {
            previousEvents: {
                'onTwitter': {
                    actions: [
                        {
                            moduleName: 'TwitterCounter',
                            methodName: 'count'
                        }
                    ]
                },
                'onRSS': {
                    actions: [
                        {
                            moduleName: 'RSSCounter',
                            methodName: 'count'
                        }
                    ]
                }
            }
        },
        'onTwitterCounted': {
            previousEvents: {
                'onParsed': {
                    previousEvents: {
                        'onTwitter': {
                            actions: [
                                {
                                    moduleName: 'FinalTwitter',
                                    methodName: 'final'
                                }
                            ]
                        }
                    }
                }
            }
        }
    });

    houston.trigger('onTwitter', 'twitter');
    houston.trigger('onRSS', 'RSS');
    */

    /*                          *\
    | end simple test of Houston |
    \*                          */

}).call(this);

/*                      *\
| end protective closure |
\*                      */
