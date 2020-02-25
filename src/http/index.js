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
Http.prototype.request = async function request(value) {
  let { url, method, data, config } = value || {};

  let requestConfig = {
    method
  };

  // 处理data
  if (method === "get") {
    const str = Object.entries(data)
      .reduce((acc, cur) => acc.concat(cur.join("=")), [])
      .join("&");
    url += "?" + str;
  } else if (method === "post") {
    // form
    if (
      config.headers["Content-Type"] === "application/x-www-form-urlencoded"
    ) {
      const form = new FormData();
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          const files = data[key];
          for (let value of files) {
            form.append("file", value);
          }
        } else {
          form.append(key, data[key]);
        }
      });
      Object.defineProperty(requestConfig, "body", {
        value: form
      });
    } else if (config.headers["Content-Type"] === "application/json") {
      // json
      Object.defineProperty(requestConfig, "body", {
        value: JSON.stringify(data)
      });
    }
  }

  const responseData = await fetch(url, requestConfig).then(response =>
    response.json()
  );
  return responseData;
};

["get", "post"].forEach(method => {
  Http.prototype[method] = function(
    url,
    data,
    config = { headers: { "Content-Type": "application/json" } }
  ) {
    return this.request({
      config,
      method,
      url,
      data
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
