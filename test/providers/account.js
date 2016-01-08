var resources = require('../resources.js');
var crap = require('../../crap');

module.exports = function auto(dependencies, callback){
  console.log("account provider initializing...");
  callback(null, dependencies);
};

// deps usage example.
// console.log(module.exports.deps({get:1}));
// console.log(module.exports.deps({getConnections:0}));
// console.log(module.exports.deps({}));
var mapping = {
  get: {
    resources: {
      users: resources.users,
      facebook: resources.facebook
    }
  },
  getConnections: {
    resources: {
      connections: resources.connections
    }
  }
};

module.exports.deps = crap.deps(mapping);
