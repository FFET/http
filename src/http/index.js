/**
 * @author Jay
 * @date 2020-02-24
 * @description http request
 */

/**
 * Create a new instance of Axios
 * @param {*} param0
 */
function Http(instanceConfig) {
  this.defaults = instanceConfig;
}

/**
 * Dispatch a request
 */
Http.prototype.request = async function request(config) {
  const { url, method } = config || {};
  const data = await fetch(url, {
    method
    // headers: { "Content-Type": "application/json" }
  }).then(response => response.json());
  return data;
};

["get", "post"].forEach(method => {
  Http.prototype[method] = function(url, data, config = {}) {
    return this.request({
      config,
      method,
      url: url,
      data: data
    });
  };
});

/**
 * bind
 * @param {*} fn
 * @param {*} thisArg
 */
function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
}

/**
 * extends
 * @param {*} a
 * @param {*} b
 * @param {*} thisArg
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === "function") {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * for each
 * @param {*} obj
 * @param {*} fn
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === "undefined") {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== "object") {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (Array.isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * create instance
 * @param {*} defaultConfig
 */
function createInstance(defaultConfig) {
  var context = new Http(defaultConfig);
  // var instance = bind(Http.prototype.request, context);
  var instance = function wrap() {
    return Http.prototype.request.apply(context, arguments);
  };

  // Copy prototype to instance
  extend(instance, Http.prototype, context);

  // Copy context to instance
  extend(instance, context);

  return instance;
}

var httpInstance = new createInstance({});

export default httpInstance;
