/**
 * @fileOverview houston.js is a composable event engine
 *               for mediating the interactions between node.js modules.
 * @author Next Century Corporation
 * @version 0.0.3
 */

/*                     *\
| module-wide variables |
\*                     */

/**
 * @namespace
 */
var Houston;

/*                         *\
| end module-wide variables |
\*                         */

/*                          *\
| creation of Houston object |
\*                          */

Houston = {

    /*                *\
    | member variables |
    \*                */

    /**
     * the module dictionary which holds all the modules
     * @type Object
     * @private
     */
    modules: {},

    /**
     * the ruleset dictionary which holds all the rules
     * @type Object
     * @private
     */
    ruleset: {},

    /*                    *\
    | end member variables |
    \*                    */

    /*       *\
    | methods |
    \*       */

    /**
     * Registers a module object with Houston.
     * @param {String} moduleName the name Houston will associate
     *                            with the module object
     * @param {Object} moduleObject the module object
     * @returns {Houston} the Houston object for method chaining
     * @throws {String} a string error message
     *                  if the module name is falsey,
     *                  the module object is falsey, or
     *                  the module name has already been registered
     *
     * @example
     * Houston.registerModule('exampleModule', {
     *     exampleMethod: function(event) {
     *         // An event has three properties.
     *         console.log(event.eventName); // the current event name
     *         console.log(event.eventData); // the current event data
     *         console.log(event.eventNameStack); // the previous event names
     *         // An event also has a chainable method called trigger
     *         // for triggering additional events.
     *         event.trigger('helloHouston', {
     *             message: 'Hello, Houston!'
     *         })
     *         .trigger('goodbyeHouston', {
     *             message: 'Goodbye, Houston!'
     *         });
     *     }
     * })
     * .registerModule('anotherExampleModule', {
     *     exampleMethod: function(event) {
     *         event.trigger('Method chaining is fun!');
     *     }
     * });
     */
    registerModule: function(moduleName, moduleObject) {
        /*      *\
        | locals |
        \*      */
        // the module dictionary
        var modules;
        // the module object previously registered with Houston
        var previouslyRegisteredModuleObject;
        /*          *\
        | end locals |
        \*          */
        // Safeguard against falsey parameters.
        if (!moduleName) {
            throw 'no module name';
        }
        if (!moduleObject) {
            throw 'no module object';
        }
        // Grab the module dictionary and look up the module name in it.
        // Make sure the module name has not already been taken.
        modules = this.modules;
        previouslyRegisteredModuleObject = modules[moduleName];
        if (previouslyRegisteredModuleObject) {
            throw 'module name "' + moduleName + '" has already been taken';
        }
        // Register the module name and module object with Houston.
        modules[moduleName] = moduleObject;

        // Support method chaining.
        return this;
    },

    /**
     * Determines whether or not a module name is registered with Houston.
     * @param {String} moduleName the module name
     * @returns {boolean} whether or not the module name is registered
     *                    with Houston
     */
    hasModule: function(moduleName) {
        return this.modules.hasOwnProperty(moduleName);
    },

    /**
     * Retrieves a module object registered with Houston.
     * @param {String} moduleName the module name
     * @returns {(Object|undefined)} the module object or
     *                               undefined if Houston cannot find it
     */
    getModule: function(moduleName) {
        return this.modules[moduleName];
    },

    /**
     * Unregisters a module name and its associated module object from Houston.
     * If the module name was never registered with Houston in the first place,
     * this function will effectively do nothing.
     * @param {String} moduleName the module name
     * @returns {Houston} the Houston object for method chaining
     */
    unregisterModule: function(moduleName) {
        delete this.modules[moduleName];

        // Support method chaining.
        return this;
    },

    /**
     * Merges a new ruleset dictionary into Houston's master ruleset dictionary.
     * @param {Object} newRuleset the new ruleset dictionary
     * @returns {Houston} the Houston object for method chaining
     */
    addRuleset: function(newRuleset) {
        /*      *\
        | locals |
        \*      */

        // the master ruleset
        var masterRuleset;
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
         * Merges a new ruleset dictionary into a master ruleset dictionary.
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
            // whether the current action from the new ruleset is a duplicate
            // of the current action from the master ruleset
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
                        masterRulesetForEvent = masterRuleset[eventName];
                        //----------------------------------------------
                        // Merge the new actions into the master rules.
                        //----------------------------------------------
                        // Grab the new and master actions.
                        // Default the master actions to an empty array.
                        newActions = newRulesetForEvent.actions;
                        masterActions = masterRulesetForEvent.actions || [];
                        // There are new actions?
                        if (newActions) {
                            // Grab the number of new actions and
                            // the number of master actions.
                            numNewActions = newActions.length;
                            numMasterActions = masterActions.length;
                            // Loop through the new actions.
                            for (i = 0; i < numNewActions; i++) {
                                newAction = newActions[i];
                                // Loop through the master actions.
                                for (j = 0; j < numMasterActions; j++) {
                                    masterAction = masterActions[j];
                                    // Determine whether the new action is
                                    // a duplicate of the master action.
                                    duplicateAction =
                                        areSameAction(masterAction, newAction);
                                    // Add the new action to the master actions
                                    // only if it's not a duplicate.
                                    if (!duplicateAction) {
                                        masterActions.push(newAction);
                                    }
                                }
                            }
                            // Update the master ruleset for the event.
                            masterRulesetForEvent.actions = masterActions;
                        }
                        //------------------------------------
                        // Merge the new previous events into
                        // the master events.
                        //------------------------------------
                        // Grab the new and master previous events.
                        newPreviousEvents = newRulesetForEvent.previousEvents;
                        masterPreviousEvents =
                            masterRulesetForEvent.previousEvents;
                        // If needed, recursively merge the new previous events
                        // into the master events.
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
         * @param {String} firstAction.module the module name for
         *                                    the first action
         * @param {String} firstAction.method the method name for
         *                                    the first action
         * @param {Object} secondAction the second action
         * @param {String} secondAction.module the module name for
         *                                     the second action
         * @param {String} secondAction.method the method name for
         *                                     the second action
         * @return {boolean} whether or not the two actions are the same action
         */
        areSameAction = function(firstAction, secondAction) {
            return firstAction.module === secondAction.module &&
                   firstAction.method === secondAction.method;
        };

        /*            *\
        | end closures |
        \*            */

        // Grab the master ruleset and recursively merge
        // the new ruleset into it.
        masterRuleset = this.ruleset;
        mergeRulesets(masterRuleset, newRuleset);

        // Support method chaining.
        return this;
    },

    /**
     * Clears Houston's master ruleset dictionary.
     * @returns {Houston} the Houston object for method chaining
     */
    clearRulesets: function() {
        this.ruleset = {};

        // Support method chaining.
        return this;
    },

    /**
     * Triggers an event.
     * Houston will asynchronously propagate the event based upon
     * its modules and ruleset.
     * @param {String} eventName the event name
     * @param {Object} eventData the event data
     * @param {String[]} [eventNameStack] This optional parameter allows you
     *                                    to "fool" Houston into thinking that
     *                                    a brand new event has a rich history
     *                                    of prior events.
     *                                    Houston keeps track of the chain of
     *                                    events in an array of strings called
     *                                    the event name stack.
     *                                    The first element in the array is
     *                                    the very first event, and the last
     *                                    element is the event which happened
     *                                    right before the current event.
     * @returns {Houston} the Houston object for method chaining
     * @throws {String} a string error message
     *                  if Houston cannot find a module or method
     *
     * @example
     * Houston.trigger('helloHouston', {
     *     message: 'Hello, Houston!'
     * })
     * .trigger('goodbyeHouston', {
     *     message: 'Goodbye, Houston!'
     * })
     * .trigger('currentEvent', {
     *     message: 'Fooling Houston!'
     * }, [
     *     'previousEvent'
     * ]);
     */
    trigger: function(eventName, eventData, eventNameStack) {
        /*      *\
        | locals |
        \*      */

        // the module dictionary
        var modules;
        // the ruleset dictionary
        var ruleset;
        // the action stack
        var actionStack;
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

        /**
         * Asynchronously propagates an event.
         * Beware, this function uses a fair amount of recursion.
         * This function calls evaluateActions and evaluatePreviousEvents.
         * In turn, evaluatePreviousEvents calls itself and evaluateActions.
         * In turn, evaluateActions calls evaluateAction which calls propagate.
         * @param {Object} event the event
         * @param {String} event.eventName the event name
         * @param {Object} event.eventData the event data
         * @param {String[]} event.eventNameStack the previous events
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
            // Grab the event name and look it up in the ruleset dictionary.
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
                setTimeout(
                    function() {
                        evaluateActions(event, actionsFromRuleset);
                    },
                    0
                );
            }
            if (previousEventsFromRuleset) {
                setTimeout(
                    function() {
                        evaluatePreviousEvents(
                            event,
                            previousEventsFromRuleset,
                            0 // the stack offset must start at 0
                        );
                    },
                    0
                );
            }
        };

        /**
         * Evaluates an array of actions.
         * @param {Object} event the event
         * @param {String} event.eventName the event name
         * @param {Object} event.eventData the event data
         * @param {String[]} event.eventNameStack the previous events
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
         * @param {Object} action the action
         * @param {String} action.module the module name
         * @param {String} action.method the method name
         * @throws {String} a string error message
         *                  if Houston cannot find a module or method
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
            // Grab the module name and look it up in the module dictionary.
            // If we can't find anything, panic!
            moduleName = action.module;
            module = modules[moduleName];
            if (!module) {
                throw 'Houston cannot find module "' + moduleName + '"';
            }
            // Grab the method name and look it up in the module.
            // If we can't find anything, panic!
            methodName = action.method;
            method = module[methodName];
            if (!method || typeof(method) !== 'function') {
                throw 'Houston cannot find method "' + moduleName +
                      '.' + methodName + '"';
            }
            // Asynchronously...
            setTimeout(
                function() {
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
                    // Call the method.
                    // Make sure the module is the "this" pointer of
                    // the method call.
                    // Pass a safe copy of the event object to the method.
                    // Add an extra chainable trigger method to the event object
                    // so that the method can trigger additional events.
                    method.call(module, {
                        eventName: eventName,
                        eventData: eventData,
                        eventNameStack: eventNameStack,
                        actionStack: actionStack,
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
                },
                0
            );
        };

        /**
         * Evaluates a dictionary of previous events.
         * Beware, this function calls itself.
         * @param {Object} event the event
         * @param {String} event.eventName the event name
         * @param {Object} event.eventData the event data
         * @param {String[]} event.eventNameStack the previous events
         * @param {Object} previousEvents This is a recursive dictionary
         *                                which holds actions which should
         *                                only be evaluated after a specific
         *                                sequence of events has occurred.
         * @param {number} stackOffset This is an integer offset from
         *                             the last event in the event name stack.
         *                             It must start at 0 and increase with each
         *                             recursive call.
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
            // Start the index at the last event name minus the stack offset and
            // loop it down to 0.
            i = numEventNames - 1 - stackOffset;
            while (i >= 0) {
                // Grab the current previous event name and check whether
                // the current previous event name is one of the previous events
                // we are looking for.
                previousEventName = eventNameStack[i];
                if (previousEvents.hasOwnProperty(previousEventName)) {
                    // Grab the ruleset for the previous event, the actions, and
                    // the previous events.
                    rulesetForPreviousEvent = previousEvents[previousEventName];
                    actionsFromRuleset = rulesetForPreviousEvent.actions;
                    previousEventsFromRuleset =
                        rulesetForPreviousEvent.previousEvents;
                    // If needed, evaluate the rules and the previous events.
                    // Make sure to update the stack offset.
                    // The stack offset should equal
                    // the number of previous event names minus the index.
                    if (actionsFromRuleset && actionsFromRuleset.length > 0) {
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
                i--;
            }
        };

        /*            *\
        | end closures |
        \*            */

        // Grab the module dictionary and the ruleset dictionary.
        modules = this.modules;
        ruleset = this.ruleset;
        // Default the event name stack to an empty array.
        eventNameStack = eventNameStack || [];
        // The action stack array and the event name stack array
        // must be kept in parallel.
        // Since we have no way of knowing what actions happened alongside
        // fake event names, we must fill the action stack with as many nulls
        // as there are fake event names in the event name stack.
        actionStack = eventNameStack.map(function() {
            return null;
        });
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

/*                              *\
| end creation of Houston object |
\*                              */

/*       *\
| exports |
\*       */

module.exports = Houston;

/*           *\
| end exports |
\*           */

/*                      *\
| simple test of Houston |
\*                      */

/*
Houston.registerModule('Parser', {
    parse: function(event) {
        console.log('Entering Parser.parse');
        console.log(event);
        event.trigger('onParsed', event.eventData);
        console.log('Leaving Parser.parse');
    }
});
Houston.registerModule('TwitterCounter', {
    count: function(event) {
        console.log('Entering TwitterCounter.count');
        console.log(event);
        event.trigger('onTwitterCounted', event.eventData);
        console.log('Leaving TwitterCounter.count');
    }
});
Houston.registerModule('RSSCounter', {
    count: function(event) {
        console.log('Entering RSSCounter.count');
        console.log(event);
        event.trigger('onRSSCounted', event.eventData);
        console.log('Leaving RSSCounter.count');
    }
});
Houston.registerModule('FinalTwitter', {
    final: function(event) {
        console.log('Entering FinalTwitter.final');
        console.log(event);
        console.log('Leaving FinalTwitter.final');
    }
});

Houston.addRuleset({
    'onTwitter': {
        actions: [
            {
                module: 'Parser',
                method: 'parse'
            }
        ]
    },
    'onRSS': {
        actions: [
            {
                module: 'Parser',
                method: 'parse'
            }
        ]
    },
    'onParsed': {
        previousEvents: {
            'onTwitter': {
                actions: [
                    {
                        module: 'TwitterCounter',
                        method: 'count'
                    }
                ]
            },
            'onRSS': {
                actions: [
                    {
                        module: 'RSSCounter',
                        method: 'count'
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
                                module: 'FinalTwitter',
                                method: 'final'
                            }
                        ]
                    }
                }
            }
        }
    }
});

Houston.trigger('onTwitter', 'twitter');
Houston.trigger('onRSS', 'RSS');
*/

/*                          *\
| end simple test of Houston |
\*                          */
