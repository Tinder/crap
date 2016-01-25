module.exports = function auto(dependencies, callback){
  console.log("alternate account controller initializing...");
  callback(null, dependencies);
};

module.exports.deps = function() {
  return {
    source: module.exports,
    providers: {
      account: require('../providers/account.js').deps({get:1})
    }
  }
}
