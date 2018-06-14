var crap = require("../");
var config = require("./crap.verbose.config.js");
var should = require('should');

var interfaces = {
  "profile": {
    "middleware": {
      "auth": {
        "controllers": {
          "session": {
            "providers": {
              "session": {
                "resources": {
                  "session": {},
                  "users": {}
                }
              }
            }
          }
        }
      }
    },
    "controllers": {
      "account": {
        "providers": {
          "account": {
            "resources": {
              "users": {},
              "facebook": "facebook!!"
            }
          }
        }
      }
    }
  }
};

describe('crap load', function () {
  if(typeof Promise!=='undefined') {
    it('should support Promises', function (done) {
      var result = crap.load.apps(config);
      result.then(function(apps) {
        should.exist(apps);
        apps.should.eql(interfaces);
        done();
      })
      .catch(done);
    });
  }
  describe('without Promises', function () {
    if(typeof Promise!=='undefined') {
      var promise = Promise;
      //BE SURE, everything works without Promises
      before(function () { Promise = undefined; });
      after(function () { Promise = promise; });
    }

    it('should load an entire chain of CRaP', function (done) {
      Promise = undefined;
      crap.load.apps(config, function(err, apps) {
        should.not.exist(err);
        should.exist(apps);
        apps.should.eql(interfaces);
        done();
      });
    });
  });
});

it('should load an entire chain of CRaP using local configs', function (done) {
  crap.load.apps('profile', {
    root: __dirname,
    apps:{profile: require('./apps/profile.js').deps()}
  }, function(err, apps) {
    should.not.exist(err);
    should.exist(apps);
    apps.should.eql(interfaces);
    done();
  });
});
