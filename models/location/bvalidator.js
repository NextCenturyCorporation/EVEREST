/**
 * New node file
 */
var winston = require('winston');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});


var dataLayer = require('../../services/database/location.js');

(function (exports) {
  exports.validate = validate;
  exports.mixin = mixin;

	function validate(object, schema, options) {
		options = mixin({}, options, validate.defaults);
		var errors = [];
	
		function done() {
			logger.info("validate " + errors);			
		}

		validateObject( object, schema, options, errors, done);


		return {
			valid : !(errors.length),
			errors : errors
		};
	}

  /**
	 * Default validation options. Defaults can be overridden by passing an
	 * 'options' hash to {@link #validate}. They can also be set globally be
	 * changing the values in <code>validate.defaults</code> directly.
	 */
  validate.defaults = {
      /**
       * <p>
       * Enforce 'format' constraints.
       * </p><p>
       * <em>Default: <code>true</code></em>
       * </p>
       */
      validateFormats: true,
      /**
       * <p>
       * When {@link #validateFormats} is <code>true</code>,
       * treat unrecognized formats as validation errors.
       * </p><p>
       * <em>Default: <code>false</code></em>
       * </p>
       *
       * @see validation.formats for default supported formats.
       */
      validateFormatsStrict: false,
      /**
       * <p>
       * When {@link #validateFormats} is <code>true</code>,
       * also validate formats defined in {@link #validate.formatExtensions}.
       * </p><p>
       * <em>Default: <code>true</code></em>
       * </p>
       */
      validateFormatExtensions: true
  };

  /**
   * Default messages to include with validation errors.
   */
  validate.messages = {
      name:					"Name attribute / property value is incorrect",
      latitude:			"Latitude attribute value is incorrect",
      longitude:		"Longitude attribute value is incorrect",
      radius:				"Radius attribute value is incorrect",
      object:				"There is a record-level error"
  };

  /**
   *
   */
  validate.formats = {
    'email':          /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
    'ip-address':     /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
    'ipv6':           /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
    'date-time':      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:.\d{1,3})?Z$/,
    'date':           /^\d{4}-\d{2}-\d{2}$/,
    'time':           /^\d{2}:\d{2}:\d{2}$/,
    'color':          /^#[a-z0-9]{6}|#[a-z0-9]{3}|(?:rgb\(\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*\))aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|and yellow$/i,
    //'style':        (not supported)
    //'phone':        (not supported)
    //'uri':          (not supported)
    'host-name':      /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])/,
    'utc-millisec':   {
      test: function (value) {
        return typeof(value) === 'number' && value >= 0;
      }
    },
    'regex':          {
      test: function (value) {
        try { new RegExp(value);}
        catch (e) { return false; }

        return true;
      }
    }
  };

  /**
   *
   */
  validate.formatExtensions = {
    'url': /^(https?|ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
  };

  function mixin(obj) {
    var sources = Array.prototype.slice.call(arguments, 1);
    while (sources.length) {
      var source = sources.shift();
      if (!source) { continue; }

      if (typeof(source) !== 'object') {
        throw new TypeError('mixin non-object');
      }

      for (var p in source) {
        if (source.hasOwnProperty(p)) {
          obj[p] = source[p];
        }
      }

    }
    return obj;
  }

	function validateObject(object, schema, options, errors, callback) {
		var props;
		
			function done() {
					logger.info("validateProperty callback " +JSON.stringify(errors));
					callback();
			}
	
			if (schema.properties) {
				props = schema.properties;
				for ( var p2 in props) {
					if (props.hasOwnProperty(p2)) {
						validateProperty(object, object[p2], p2, props[p2],	options, errors, done);
					}
				}
			}
	}

//	var properties;
//	var props = [];
//				for ( var p2 in properties) {
//					if (properties.hasOwnProperty(p2)) {
//						props.push(p2);
//					}
//				}
//				
//				forEachProp(props, object, options, errors, function(property, index, next) {
//					logger.info("Property " + property);
//					next();
//				}, function() {
//					logger.info("validateProperty done?");					
//				});
//			}
//	}
//	
//	function forEachProp(props, object, options, errors, visitor, done) {
//		forEachPropRec(0, props, object, options, errors, visitor, done);
//	}
//	
//	function forEachPropRec(index, props, object, options, errors, visitor, done) {
//		if (index < props.length) {
//			visitor(props[index], index, function (){
//				var p2 = props[index];
//				//if (props.hasOwnProperty(p2)) {
//					validateProperty(object, object[p2], p2, props[p2],	options, errors, done);
//				//}
//				forEachPropRec(index+1, props, object, options, errors, visitor, done);
//			});
//		} else {
//			done();
//		}
//	}

  function validateProperty(object, value, property, schema, options, errors, done) {

//		var errorFound = handleStandard(object, value, property, schema, options, errors);
//		if (errorFound) {
//			error(property, property, value, schema, errors);
//		}

		switch (property) {
		
		case 'name':
				nameExists( value, function (err, found) {
					if (found) {
						error('name', property, value, schema, errors, property + " already exists.");
						logger.info("nameExists callback/closure " + JSON.stringify(errors));
					}
					done();
				});
			break;

		case 'longitude':
			if (errorFound) {
				error('longitude', property, value, schema, errors);
			}
			break;
		
		case 'latitude':
			if (errorFound) {
				error('latitude', property, value, schema, errors);
			}
			break;
		
		case 'radius':
			if (errorFound) {
				error('radius', property, value, schema, errors);
			}
			break;
		
		case 'record':
			locationExists( object, function (err, found) {
				if (found) {
					error('record', property, value, schema, errors, property + " already exists.");
					logger.info("locationExists callback/closure " + JSON.stringify(errors));
				}
				done();
			});
			break;
		}
  }
 
  var nameExists = function (value, callback) {
		dataLayer.readLocationByProperty('name', value, function(err, locs) {
			if (err) {
				error('name', 'name', value, schema, errors, 'Error reading location name ' + err);
				logger.info({ error : "Error getting locationByName " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("Location found for nameExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("Location name not found " + value);
				callback(err, false);
			}
		});
  };
  
  var locationExists = function(object, callback) {
		dataLayer.readLocationByObject(object, function(err, locs){
			if (err) {
				error('object', 'record', object, schema, errors, 'Error reading location ' + err);
				logger.info({ error : "Error getting locationByObject " + err });
				callback(err, false);
			} else if (0 !== locs.length) {
				logger.info("Location found for locationExists" + JSON.stringify(locs));
				callback(err, true);
			} else {
				logger.info("Location not found " + JSON.stringify(object));
				callback(err, false);
			}
		});
  };
  
  function handleStandard(object, value, property, schema, options, errors) {

		if(schema.operations !== undefined) {
			switch(schema.operations) {
			case 'post' :
				break;
			}
		}
/*
	var format, spec;
    
    function constrain(name, value, assert) {
      if (schema[name] !== undefined && !assert(value, schema[name])) {
        error(name, property, value, schema, errors);
      }
    }

    if (value === undefined) {
      if (schema.required && schema.type !== 'any') {
        return error('required', property, undefined, schema, errors);
      } else {
        return;
      }
    }

    if (options.cast) {
      if (('integer' === schema.type || 'number' === schema.type) && value == +value) {
        value = +value;
      }

      if ('boolean' === schema.type) {
        if ('true' === value || '1' === value || 1 === value) {
          value = true;
        }

        if ('false' === value || '0' === value || 0 === value) {
          value = false;
        }
      }
    }

    if (schema.format && options.validateFormats) {
      format = schema.format;

      spec = '';
      if (options.validateFormatExtensions) { spec = validate.formatExtensions[format]; }
      if (!spec) { spec = validate.formats[format]; }
      if (!spec) {
        if (options.validateFormatsStrict) {
          return error('format', property, value, schema, errors);
        }
      }
      else {
        if (!spec.test(value)) {
          return error('format', property, value, schema, errors);
        }
      }
    }

    if (schema['enum'] && schema['enum'].indexOf(value) === -1) {
      error('enum', property, value, schema, errors);
    }

    // Dependencies (see 5.8)
    if (typeof schema.dependencies === 'string' &&
        object[schema.dependencies] === undefined) {
      error('dependencies', property, null, schema, errors);
    }

    if (isArray(schema.dependencies)) {
      for (var i = 0, l = schema.dependencies.length; i < l; i++) {
        if (object[schema.dependencies[i]] === undefined) {
          error('dependencies', property, null, schema, errors);
        }
      }
    }

    if (typeof schema.dependencies === 'object') {
      validateObject(object, schema.dependencies, options, errors);
    }

    checkType(value, schema.type, function(err, type) {
      if (err) return error('type', property, typeof value, schema, errors);

      constrain('conform', value, function (a, e) { return e(a, object); });

      switch (type || (isArray(value) ? 'array' : typeof value)) {
        case 'string':
          constrain('minLength', value.length, function (a, e) { return a >= e; });
          constrain('maxLength', value.length, function (a, e) { return a <= e; });
          constrain('pattern',   value,        function (a, e) {
            e = typeof e === 'string' ? e = new RegExp(e) : e;
            return e.test(a);
          });
          break;
        case 'integer':
        case 'number':
          constrain('minimum',     value, function (a, e) { return a >= e; });
          constrain('maximum',     value, function (a, e) { return a <= e; });
          constrain('exclusiveMinimum', value, function (a, e) { return a > e; });
          constrain('exclusiveMaximum', value, function (a, e) { return a < e; });
          constrain('divisibleBy', value, function (a, e) {
            var multiplier = Math.max((a - Math.floor(a)).toString().length - 2, (e - Math.floor(e)).toString().length - 2);
            multiplier = multiplier > 0 ? Math.pow(10, multiplier) : 1;
            return (a * multiplier) % (e * multiplier) === 0;
          });
          break;
        case 'array':
          constrain('items', value, function (a, e) {
            for (var i = 0, l = a.length; i < l; i++) {
              validateProperty(object, a[i], property, e, options, errors);
            }
            return true;
          });
          constrain('minItems', value, function (a, e) { return a.length >= e; });
          constrain('maxItems', value, function (a, e) { return a.length <= e; });
          constrain('uniqueItems', value, function (a) {
            var h = {};

            for (var i = 0, l = a.length; i < l; i++) {
              var key = JSON.stringify(a[i]);
              if (h[key]) return false;
              h[key] = true;
            }

            return true;
          });
          break;
        case 'object':
          // Recursive validation
          if (schema.properties || schema.patternProperties || schema.additionalProperties) {
            validateObject(value, schema, options, errors);
          }
          break;
      }
    });
  */
		return false;
  }

  function checkType(val, type, callback) {
    //var result = false,
    var types = isArray(type) ? type : [type];

    // No type - no check
    if (type === undefined) return callback(null, type);

    // Go through available types
    // And find first matching
    for (var i = 0, l = types.length; i < l; i++) {
      type = types[i].toLowerCase().trim();
      if (type === 'string' ? typeof val === 'string' :
          type === 'array' ? isArray(val) :
          type === 'object' ? val && typeof val === 'object' && !isArray(val) :
          type === 'number' ? typeof val === 'number' :
          type === 'integer' ? typeof val === 'number' && ~~val === val :
          type === 'null' ? val === null :
          type === 'boolean'? typeof val === 'boolean' :
          type === 'any' ? typeof val !== 'undefined' : false) {
        return callback(null, type);
      }
    }

    callback(true);
  }

function error(attribute, property, actual, schema, errors, msg) {

	var lookup = {
		expected : schema[attribute],
		attribute : attribute,
		property : property
	};

	var message = msg || (schema.messages && schema.messages[attribute]) || schema.message || validate.messages[attribute] || "no default message";

	message = message.replace(/%\{([a-z]+)\}/ig, function(_, match) {
		var msg = lookup[match.toLowerCase()] || "";
		return msg;
	});
	errors.push({
		attribute : attribute,
		property : property,
		expected : schema[attribute],
		actual : actual,
		message : message
	});
}

  function isArray(value) {
    var s = typeof value;
    if (s === 'object') {
      if (value) {
        if (typeof value.length === 'number' &&
           !(value.propertyIsEnumerable('length')) &&
           typeof value.splice === 'function') {
           return true;
        }
      }
    }
    return false;
  }


})(typeof(window) === 'undefined' ? module.exports : (window.json = window.json || {}));