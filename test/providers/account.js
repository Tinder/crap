var resources = require('../resources.js');

module.exports = function auto(dependencies, callback){
  console.log("account provider initializing...");
  callback(null, dependencies);
};

var extend = function(a, b) {
  for (k in b) {
    a[k] = b[k];
  }
}

// deps usage example.
// console.log(module.exports.deps({get:1}));
// console.log(module.exports.deps({getConnections:0}));
// console.log(module.exports.deps({}));
module.exports.deps = function(restrict) {
  restrict = restrict || {};
  var mapping = {
    get: {users: resources.users, facebook: resources.facebook},
    getConnections: {connections: resources.connections}
  }
  var included = {};
  var excluded = {};
  var useInclude = false;
  for (k in mapping) {
    if (restrict[k]) {
      extend(included, mapping[k]);
      useInclude = true;
    } else if (restrict[k] == undefined) {
      extend(excluded, mapping[k]);
    }
  }
  return {
    resources: (useInclude ? included : excluded)
  };
}
