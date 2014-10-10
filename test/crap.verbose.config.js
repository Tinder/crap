

var cfg = module.exports = {
  root: __dirname,
  //business logic
  controllers: {
    account: {
      settings: {},
      source: "./controllers/account.js",
      providers: {
        get account() { return cfg.providers.account; }
      }
    },
    session: {
      settings: {},
      source: "./controllers/session.js",
      providers: {
        get session() { return cfg.providers.session; }
      }
    }
  },

  //a facade in front of 1 or more resources
  providers: {
    account: {
      settings: {},
      source: "./providers/account.js",
      resources: {
        get users() { return cfg.resources.users; },
        get facebook() { return cfg.resources.facebook; }
      }
    },
    session: {
      settings: {},
      source: "./providers/session.js",
      resources: {
        get session() { return cfg.resources.session; },
        get users() { return cfg.resources.users; }
      }
    }
  },

  //raw data access
  resources: {
    users: {
      settings: {},
      source: "./resources/mongo.js?collection#users"
    },
    facebook: {
      settings: {
        api_key: "nasvdasodino4in0v8n302n3inc09"
      },
      source: "./resources/facebook.js"
    },
    session: {
      settings: {},
      source: "./resources/session.js"
    }
  }
};
