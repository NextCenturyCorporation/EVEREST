/**
 * @fileOverview Houston.js is a composable event engine
 *               for mediating the interactions between node.js modules.
 * @author Next Century Corporation
 * @version 0.0.2
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
    ruleset: {
        'onTwitter': {
            rules: [
                {
                    module: 'Parser',
                    method: 'parse'
                }
            ]
        },
        'onRSS': {
            rules: [
                {
                    module: 'Parser',
                    method: 'parse'
                }
            ]
        },
        'onParsed': {
            previousEvents: {
                'onTwitter': {
                    rules: [
                        {
                            module: 'TwitterCounter',
                            method: 'count'
                        }
                    ]
                },
                'onRSS': {
                    rules: [
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
                            rules: [
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
    },

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
     *         // If the ruleset specifies a return event, as soon as
     *         // this method returns, the return event will be triggered.
     *         // The return value of this method will serve as the event data
     *         // for the return event.
     *         return {
     *             message: 'Thanks, Houston!'
     *         };
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
        // the closures
        var propagate;
        var evaluateRules;
        var evaluateRule;
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
         * This function calls evaluateRules and evaluatePreviousEvents.
         * In turn, evaluatePreviousEvents calls itself and evaluateRules.
         * In turn, evaluateRules calls evaluateRule which calls propagate.
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
            // the rules from the ruleset
            var rulesFromRuleset;
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
            // grab the rules and the previous events.
            rulesFromRuleset = rulesetForEvent.rules;
            previousEventsFromRuleset = rulesetForEvent.previousEvents;
            // If needed, asynchronously evaluate
            // the rules and the previous events.
            if (rulesFromRuleset && rulesFromRuleset.length > 0) {
                setTimeout(
                    function() {
                        evaluateRules(event, rulesFromRuleset);
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
         * Evaluates an array of rules.
         * @param {Object} event the event
         * @param {String} event.eventName the event name
         * @param {Object} event.eventData the event data
         * @param {String[]} event.eventNameStack the previous events
         * @param {Object[]} rules the rules
         */
        evaluateRules = function(event, rules) {
            /*      *\
            | locals |
            \*      */
            // the number of rules
            var numRules;
            // loop variable
            var i;
            // the current rule
            var rule;
            /*          *\
            | end locals |
            \*          */
            numRules = rules.length;
            for (i = 0; i < numRules; i++) {
                rule = rules[i];
                evaluateRule(event, rule);
            }
        };

        /**
         * Asynchronously evaluates a rule.
         * @param {Object} event the event
         * @param {String} event.eventName the event name
         * @param {Object} event.eventData the event data
         * @param {String[]} event.eventNameStack the previous events
         * @param {Object} rule the rule
         * @param {String} rule.module the module name
         * @param {String} rule.method the method name
         * @param {String} [rule.returnEvent] the name of the event to trigger
         *                                    as soon as the method returns
         *                                    a value
         * @throws {String} a string error message
         *                  if Houston cannot find a module or method
         */
        evaluateRule = function(event, rule) {
            /*      *\
            | locals |
            \*      */
            // the name of the event
            var eventName;
            // the event data
            var eventData;
            // the previous event names
            var eventNameStack;
            // the module name
            var moduleName;
            // the module
            var module;
            // the method name
            var methodName;
            // the method
            var method;
            // the name of the event to trigger
            // as soon as the method returns a value
            var returnEventName;
            /*          *\
            | end locals |
            \*          */
            // Grab the event name, event data, and event name stack.
            eventName = event.eventName;
            eventData = event.eventData;
            eventNameStack = event.eventNameStack;
            // Grab the module name and look it up in the module dictionary.
            // If we can't find anything, panic!
            moduleName = rule.module;
            module = modules[moduleName];
            if (!module) {
                throw 'Houston cannot find module "' + moduleName + '"';
            }
            // Grab the method name and look it up in the module.
            // If we can't find anything, panic!
            methodName = rule.method;
            method = module[methodName];
            if (!method || typeof(method) !== 'function') {
                throw 'Houston cannot find method "' + moduleName +
                      '.' + methodName + '"';
            }
            // Grab the return event name.
            returnEventName = rule.returnEvent;
            // Asynchronously...
            setTimeout(
                function() {
                    /*      *\
                    | locals |
                    \*      */
                    // the return value
                    var returnValue;
                    /*          *\
                    | end locals |
                    \*          */
                    // Call the method.
                    // Make sure the module is the "this" pointer of
                    // the method call.
                    // Pass a safe copy of the event object to the method.
                    // Add an extra chainable trigger method to the event object
                    // so that the method can trigger additional events.
                    returnValue = method.call(module, {
                        eventName: eventName,
                        eventData: eventData,
                        eventNameStack: eventNameStack,
                        trigger: function(newEventName, newEventData) {
                            // Asynchronously propagate the new event.
                            propagate({
                                eventName: newEventName,
                                eventData: newEventData,
                                eventNameStack: eventNameStack.concat(eventName)
                            });

                            // Support method chaining.
                            return this;
                        }
                    });
                    // If there's a return event name,
                    // asynchronously propagate the return event.
                    if (returnEventName) {
                        propagate({
                            eventName: returnEventName,
                            eventData: returnValue,
                            eventNameStack: eventNameStack.concat(eventName)
                        });
                    }
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
         *                                which holds rules which should
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
            // the rules from the ruleset
            var rulesFromRuleset;
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
                    // Grab the ruleset for the previous event, the rules, and
                    // the previous events.
                    rulesetForPreviousEvent = previousEvents[previousEventName];
                    rulesFromRuleset = rulesetForPreviousEvent.rules;
                    previousEventsFromRuleset =
                        rulesetForPreviousEvent.previousEvents;
                    // If needed, evaluate the rules and the previous events.
                    // Make sure to update the stack offset.
                    // The stack offset should equal
                    // the number of previous event names minus the index.
                    if (rulesFromRuleset && rulesFromRuleset.length > 0) {
                        evaluateRules(event, rulesFromRuleset);
                    }
                    if (previousEvents) {
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

        // Grab the module dictionary and the ruleset dictionary, and
        // asynchronously propagate the event.
        modules = this.modules;
        ruleset = this.ruleset;
        propagate({
            eventName: eventName,
            eventData: eventData,
            eventNameStack: eventNameStack || []
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

Houston.trigger('onTwitter', 'twitter');
Houston.trigger('onRSS', 'RSS');

/*                          *\
| end simple test of Houston |
\*                          */
