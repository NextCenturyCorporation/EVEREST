var basePath = '../../../..';
var servicesPath = basePath + '/services';
var houstonPath = servicesPath + '/houston';
var Houston;

describe('Houston', function() {

    beforeEach(function() {
        // Make sure we always start with a fresh Houston.
        Houston = require(houstonPath);
    });

    it('should register and unregister a valid module', function() {
        /*      *\
        | locals |
        \*      */
        // the Batman module
        var batman;
        // whether Houston has the Batman module
        var houstonHasBatman;
        // a possibly fake Batman module
        var possiblyFakeBatman;
        /*          *\
        | end locals |
        \*          */
        // Create the Batman.
        batman = {
            secretIdentity: 'Bruce Wayne',
            fightCrime: function() {
                // Batman always does this.
            }
        };
        // Register the Batman.
        Houston.registerModule('Batman', batman);
        // Make sure Houston has the Batman.
        houstonHasBatman = Houston.hasModule('Batman');
        expect(houstonHasBatman).toEqual(true);
        // Make sure Houston has the real Batman.
        possiblyFakeBatman = Houston.getModule('Batman');
        expect(possiblyFakeBatman).toBe(batman);
        // Really, really, really make sure Houston has the real Batman.
        possiblyFakeBatman = Houston.modules['Batman'];
        expect(possiblyFakeBatman).toBe(batman);
        // Unregister the Batman.
        Houston.unregisterModule('Batman');
        // Make sure Houston no longer has the Batman.
        houstonHasBatman = Houston.hasModule('Batman');
        expect(houstonHasBatman).toEqual(false);
        // Make sure Houston no longer has the real Batman.
        possiblyFakeBatman = Houston.getModule('Batman');
        expect(possiblyFakeBatman).not.toBe(batman);
        // Really, really, really make sure Houston no longer has
        // the real Batman.
        possiblyFakeBatman = Houston.modules['Batman'];
        expect(possiblyFakeBatman).not.toBe(batman);
    });

    it('should refuse to register an invalid module', function() {
        // You cannot register a module without a module name!
        expect(function() {
            Houston.registerModule();
        }).toThrow('no module name');
        // You cannot register a module without a module object!
        expect(function() {
            Houston.registerModule('Batman');
        }).toThrow('no module object');
        // Register a valid module.
        Houston.registerModule('Batman', {});
        // You cannot overwrite a module object that already been registered!
        expect(function() {
            Houston.registerModule('Batman', {});
        }).toThrow('module name "Batman" has already been taken');
        // Unregister the valid module.
        Houston.unregisterModule('Batman');
        // Now, it's safe to register a module object under the module name
        // "Batman".
        Houston.registerModule('Batman', {});
    });

});
