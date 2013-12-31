//------------
// houston.js
//------------
// a composable event engine for mediating
// the interactions between node.js modules

/*                     *\
| module-wide variables |
\*                     */

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

    // the module dictionary which holds all the modules
    modules: {},

    // the ruleset dictionary which holds all the rules
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

    // This function takes...
    // (1) a module name
    // (2) a module object
    // and registers the module name and module object with Houston.
    // This function throws an exception if...
    // (1) the module name does not exist
    // (2) the module object does not exist
    // (3) the module name has already been registered
    // This function returns a reference to the Houston object
    // so that you can chain together calls to the Houston object.
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
        // No module?
        if (!moduleName) {
            throw 'module name does not exist';
        }
        // No module object?
        if (!moduleObject) {
            throw 'module object does not exist';
        }
        // Grab the module dictionary and look up the module name in it.
        modules = this.modules;
        previouslyRegisteredModuleObject = modules[moduleName];
        // The module name has already been taken?
        if (previouslyRegisteredModuleObject) {
            throw 'module name "' + moduleName + '" has already been taken';
        }
        // Register the module name and module object with Houston.
        modules[moduleName] = moduleObject;

        return this;
    },

    // This function takes...
    // - a module name
    // and returns whether or not the module name is
    // currently registered with Houston.
    hasModule: function(moduleName) {
        return this.modules.hasOwnProperty(moduleName);
    },

    // This function takes...
    // - a module name
    // and unregisters that module name from Houston.
    // If the module name was never registered with Houston in the first place,
    // this function will effectively do nothing.
    // This function returns a reference to the Houston object
    // so that you can chain together calls to the Houston object.
    unregisterModule: function(moduleName) {
        delete this.modules[moduleName];
        return this;
    },

    // This function takes...
    // (1) an event name
    // (2) event data
    // and asynchronously propagates the event throughout Houston.
    // This is pretty much the main entry point to Houston.
    // This function returns a reference to the Houston object
    // so that you can chain together calls to the Houston object.
    trigger: function(eventName, eventData) {
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

        // This function takes...
        // - an event
        // and asynchronously propagates it throughout Houston.
        // This function returns nothing.
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
            eventName = event.eventName;
            rulesetForEvent = ruleset[eventName];
            // No ruleset for the event?
            if (!rulesetForEvent) {
                // Stop!
                return;
            }
            // From the ruleset for the event,
            // grab the rules and the previous events.
            rulesFromRuleset = rulesetForEvent.rules;
            previousEventsFromRuleset = rulesetForEvent.previousEvents;
            // Asynchronously evaluate the rules and the previous events
            // if needed.
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
                            0
                        );
                    },
                    0
                );
            }
        };

        // This function takes...
        // (1) an event
        // (2) rules
        // and evaluates the rules.
        // This function returns nothing.
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
            // Loop through the rules.
            numRules = rules.length;
            for (i = 0; i < numRules; i++) {
                // Grab the current rule and evaluate it.
                rule = rules[i];
                evaluateRule(event, rule);
            }
        };

        // This function takes...
        // (1) an event
        // (2) a rule
        // and asynchronously evaluates the rule.
        // This function returns nothing.
        evaluateRule = function(event, rule) {
            /*      *\
            | locals |
            \*      */
            // the name of the event
            var eventName;
            // the event data
            var eventData;
            // the list of the previous event names in the chain of events
            var eventNameStack;
            // the name of the module to execute
            var moduleName;
            // the module to execute
            var module;
            // the name of the method to execute
            var methodName;
            // the method to execute
            var method;
            // the name of the event to propagate
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
            moduleName = rule.module;
            module = modules[moduleName];
            // No module?
            if (!module) {
                // Stop!
                return;
            }
            // Grab the method name and look it up in the module.
            methodName = rule.method;
            method = module[methodName];
            // No method?
            if (!method || typeof(method) !== 'function') {
                // Stop!
                return;
            }
            // Grab the return event name.
            returnEventName = rule.returnEvent;
            // Asynchronously...
            setTimeout(
                function() {
                    /*      *\
                    | locals |
                    \*      */
                    var returnValue;
                    /*          *\
                    | end locals |
                    \*          */
                    // Call the method.
                    // Make sure the module is the "this" pointer.
                    // Pass a safe copy of the event object to the method.
                    // Add an extra trigger function to the event object
                    // so that the method can asynchronously propagate
                    // new events as they happen.
                    returnValue = method.call(module, {
                        eventName: eventName,
                        eventData: eventData,
                        eventNameStack: eventNameStack,
                        trigger: function(newEventName, newEventData) {
                            // Asynchronously propagate
                            // the new event throughout Houston.
                            propagate({
                                eventName: newEventName,
                                eventData: newEventData,
                                eventNameStack: eventNameStack.concat(eventName)
                            });
                        }
                    });
                    // There's a return event name?
                    if (returnEventName) {
                        // Asynchronously propagate
                        // the return event throughout Houston.
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

        // This function takes...
        // (1) an event
        // (2) the previous events
        //     (This is a highly recursive structure which holds
        //      rules which should only be evaluated after
        //      a specific sequence of events has occurred.)
        // (3) an offset from the last event name in the event name stack
        //     (This offset starts at 0 and increases
        //      with each recursive call.)
        // and evaluates the previous events.
        // This function returns nothing.
        evaluatePreviousEvents = function(event, previousEvents, stackOffset) {
            /*      *\
            | locals |
            \*      */
            // the name of the event
            var eventName;
            // the list of the previous event names in the chain of events
            var eventNameStack;
            // the number of previous event names
            var numEventNames;
            // the index into the list of previous event names
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
            // Grab the event name and the event name stack.
            eventName = event.eventName;
            eventNameStack = event.eventNameStack;
            // Grab the number of previous event names.
            numEventNames = eventNameStack.length;
            // Start the index at the last event name
            // in the event name stack minus the stack offset.
            i = numEventNames - 1 - stackOffset;
            // Loop the index down to 0.
            while (i >= 0) {
                // Grab the current previous event name.
                previousEventName = eventNameStack[i];
                // The current previous event name is one of the previous events
                // we are looking for?
                if (previousEvents.hasOwnProperty(previousEventName)) {
                    // Grab the ruleset for the previous event, the rules, and
                    // the previous events.
                    rulesetForPreviousEvent = previousEvents[previousEventName];
                    rulesFromRuleset = rulesetForPreviousEvent.rules;
                    previousEventsFromRuleset =
                        rulesetForPreviousEvent.previousEvents;
                    // Evaluate the rules and the previous events if needed.
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
                // Decrement the index.
                i--;
            }
        };

        /*            *\
        | end closures |
        \*            */

        // Grab...
        // (1) the module dictionary
        // (2) the ruleset dictionary
        modules = this.modules;
        ruleset = this.ruleset;
        // Asynchronously propagate the event throughout Houston.
        propagate({
            eventName: eventName,
            eventData: eventData,
            eventNameStack: []
        });

        return this;
    }

    /*           *\
    | end methods |
    \*           */

};

/*                              *\
| end creation of Houston object |
\*                              */

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
