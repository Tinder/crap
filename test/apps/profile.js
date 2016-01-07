
module.exports = function auto(dependencies, callback){
  console.log("profile app initializing...");
  callback(null, dependencies);
};

module.exports.deps = function() {
  return {
    source: __filename,
    middleware: {
      auth: require('../middleware/auth.js').deps()
    },
    controllers: {
      account: require('../alternates/account.js').deps()
    }
  }
}
