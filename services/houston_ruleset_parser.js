/**
 * @fileOverview HoustonRulesetParser is a lexer and parser for the
 *               Houston Ruleset (HRS) domain-specific language (DSL).
 *               HRS is a convenient web-developer-friendly representation
 *               of Houston's ruleset dictionary inspired by
 *               Cascading Stylesheets (CSS).
 *               Houston's ruleset dictionary is optimized for performance,
 *               not human readability.
 *               Although it can be easily represented in JSON format,
 *               it can often become confusingly recursive and overly verbose.
 *               HRS is a higher-level language which sits on top of the
 *               lower-level ruleset dictionary.
 * @author Next Century Corporation
 * @version 0.0.2
 *
 * @example
 * var houstonRulesetParser = require('houston_ruleset_parser');
 * var json = houstonRulesetParser.parse(
 *     'exampleEvent { ExampleModule.exampleMethod; }'
 * );
 */

/*                     *\
| module-wide variables |
\*                     */

/**
 * @namespace
 */
var HoustonRulesetParser;

/*                         *\
| end module-wide variables |
\*                         */

/*                                       *\
| creation of HoustonRulesetParser object |
\*                                       */

HoustonRulesetParser = {

    /**
     * Lexes and parses the Houston Ruleset (HRS)
     * domain-specific language (DSL).
     * Each HRS rule is compiled into a separate ruleset dictionary.
     * The resulting ruleset dictionaries can then be immediately
     * added to Houston or stringified into a JSON array.
     * @param {String} input the HRS input string
     * @returns {Object[]} an array of ruleset dictionaries
     * @throws {String} a string error message
     *                  if unable to lex or parse the input string
     *
     * @example
     * //----------------
     * // begin HRS rule
     * //----------------
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
     * //--------------
     * // end HRS rule
     * //--------------
     * //-------------------------------------------------------------------
     * // P.S. All of the code above, including the comments, is valid HRS.
     * // P.P.S. HRS supports both C++-style and C-style comments.
     * //-------------------------------------------------------------------
     */
    parse: function(input) {
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
         * @throws {String} a string error message
         *                  if unable to lex the input string
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
             * Determines whether or not a character is an indentifier character.
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
             * Throws a string error message explaining what went wrong.
             * @throws a string error message explaining what went wrong
             */
            panic = function() {
                throw 'unrecognized token at character "' + c + '"';
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
         * Parses an array of HRS tokens into an array of ruleset dictionaries.
         * @param {String} tokens the array of HRS tokens
         * @returns {Object[]} an array of ruleset dictionaries
         * @throws {String} a string error message
         *                  if unable to parse the input string
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
             * Throws a string error message explaining what went wrong.
             * @throws a string error message explaining what went wrong
             */
            panic = function() {
                throw 'unexpected "' + token.type +
                      '" token of value "' + token.value + '"';
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
                        while (token.type === 'identifier') {
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
                        eventSelectorsBetweenCommas[numEventSelectorCommas] =
                            [];
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
                        methodName =
                            moduleNameAndMethodName.slice(dotIndex + 1);
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
                            rulesets.push(
                                convertToRuleset(
                                    eventSelectorsBetweenCommas[j],
                                    actions
                                )
                            );
                        }
                        // Reset the number of event selector commas and
                        // the event selectors between commas
                        // for the current HRS rule.
                        numEventSelectorCommas = 0;
                        eventSelectorsBetweenCommas = [];
                        eventSelectorsBetweenCommas[numEventSelectorCommas] =
                            [];
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
                        // Add the current HRS action to the array of actions
                        // for the current HRS rule.
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

        // Lex and then parse the input string.
        // Return the output.
        return parser(lexer(input));
    }
};

/*                                           *\
| end creation of HoustonRulesetParser object |
\*                                           */

/*       *\
| exports |
\*       */

module.exports = HoustonRulesetParser;

/*           *\
| end exports |
\*           */

/*                                   *\
| simple test of HoustonRulesetParser |
\*                                   */

/*
console.log(HoustonRulesetParser.parse('onA onB, onA onC { C.c; D.d; }'));
*/

/*                                       *\
| end simple test of HoustonRulesetParser |
\*                                       */
