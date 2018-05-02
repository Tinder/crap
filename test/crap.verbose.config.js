

var cfg = module.exports = {
  root: __dirname,

  apps: {
    profile: {
      settings: {},
      source: "./apps/profile.js",
      middleware: {
        get auth() { return cfg.middleware.auth; }
      },
      controllers: {
        get account() { return cfg.controllers.account }
      }
    }
  },

  middleware: {
    auth: {
      settings:{},
      source: "./middleware/auth.js",
      controllers: {
        get session() { return cfg.controllers.session; }
      }
    }
  },

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
      settings: {},
      source: "./resources/facebook.js"
    },
    session: {
      settings: {},
      source: "./resources/session.js"
    }
  }
};
