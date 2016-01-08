var parallel = require('./parallel.js');
var url = require("url");
var path = require("path");
var fs = require("fs");
var assign = require("object-assign");
var debug = require("debug")("crap");
var cache = {};

var types = ["apis","apps","middleware","controllers","providers","resources"];

var crap = module.exports = {
  root: process.cwd(),
  get config() {
    var p = crap.root + '/crap.config.js';
    return crap.open(p);
  },
  open: function(filename) {
    var result = cache[filename];
    if(!result) {
      filename = path.resolve(crap.root, filename);
      var exists = fs.existsSync(filename);
      if(debug.enabled) debug("opening.. "+filename);
      result = cache[filename] = (exists && require(filename)) || {};
    }
    return result;
  },
  resolve: function(root, type, name) {
    return root + '/' + type + '/' + name;
  },
  support: function(more_types) {
    more_types = array(more_types);
    types = types.concat(more_types).filter(unique);
    crap.load = bind_helpers(crap);
    function unique(value, index, self) {
      return self.indexOf(value) === index;
    }
  },
  loaders: {
    file: function(crap_cfg, type, name, source) {
      var pathname = source.pathname;
      if(/^\.?\.?\//.test(pathname))
        pathname = path.resolve(crap_cfg.root, source.pathname);
      var query = source.query;
      var hash = source.hash && source.hash.substr(1);

      return function(cb) {
        if(debug.enabled) debug("using builder: " + pathname);
        var builder = require(pathname);
        var args = hash? hash.split(',') : [];
        args.push(cb);

        if(query) {
          builder = builder[query];
          if(typeof builder !== "function")
            throw new Error("Cannot execute property: name='"+query+"', type='"+(typeof builder)+"', file='"+pathname+"'");
        }
        var ctx = {
          config: crap_cfg,
          type: type,
          name: name
        };
        ctx.load = bind_helpers(ctx);
        if(builder.name !== "auto" && !builder.__auto)
          return builder.apply(ctx, args);

        //auto load; infer dependencies from config
        var tasks = {};
        if(debug.enabled) debug("inferring dependencies from config:");
        types.forEach(function(type) {
          var cfg = crap_cfg[type];
          var keys = cfg && Object.keys(cfg);
          if(keys && keys.length){
            tasks[type] = load.bind(ctx, type, keys, crap_cfg);
            if(debug.enabled) debug("\t"+type+": " + keys);
          }
        });
        parallel(tasks, function(err, results) {
          if(err) return cb(err);
          args.unshift(results);
          var return_value = builder.apply(ctx, args);
          if(return_value && typeof return_value.then === "function")
            return_value.then(cb.bind(null, null), cb);
        });
      }
    }
  }
};
crap.load = bind_helpers(crap);

crap.deps = function(mapping) {
  return function(fns) {
    fns = fns || {};

    var included = {};
    var notExcluded = {};
    var useInclude = false;

    for (var k in mapping) {
      if (!mapping.hasOwnProperty(k)) continue;

      var cfg = null;

      if (fns[k]) {
        useInclude = true;
        cfg = included;
      } else if (fns[k] == undefined) {
        cfg = notExcluded;
      }

      if (!cfg) continue;

      types.forEach(function(type) {
        if (!mapping[k][type]) return;
        if (!cfg[type]) cfg[type] = {};
        assign(cfg[type], mapping[k][type]);
      });
    }

    return (useInclude ? included : notExcluded);
  }
};

function get_loader(protocol) {
  for (var i=1; i<arguments.length; i++) {
    var obj = arguments[i];
    var loader = obj.loaders && obj.loaders[protocol];
    if(loader) return loader;
  }
}

function load(type) {
  var list,crap_cfg,callback = arguments[arguments.length-1];
  if(typeof callback!=='function') callback = undefined;
  var signature = Array.prototype.map.call(arguments, function(arg){ return Array.isArray(arg)? "array" : typeof arg }).join();

  switch(signature) {
    case "string,string,object":
    case "string,string,object,function":
    case "string,array,object":
    case "string,array,object,function":
      list = array(arguments[1]);
      crap_cfg = arguments[2];
      break;
    case "string,array":
    case "string,array,function":
    case "string,string":
    case "string,string,function":
      list = array(arguments[1]);
      break;
    case "string,object":
    case "string,object,function":
      crap_cfg = arguments[1];
      break;
    case "string":
    case "string,function":
      break;
    default:
      throw new Error("unknown signature: "+ signature);
  }
  if(!crap_cfg) crap_cfg = this.config || { root: crap.root };
  if(!list) list = crap_cfg[type]? Object.keys(crap_cfg[type]) : [];

  var tasks = {};
  var root = crap_cfg.root || crap.root;

  if(debug.enabled) debug("loading "+type+": " +list.join());
  list.forEach(function(name) {
    var cfg = (crap_cfg[type] && crap_cfg[type][name]) || {};

    var source = url.parse(cfg.source || crap.resolve(cfg.root || root, type, name));
    var protocol = (source.protocol || "file:").replace(/:$/,'');
    if(!cfg.root) cfg.root = root;

    var loader = get_loader(protocol, cfg, crap.config, crap);
    if(!loader) throw Error('Unknown protocol: "'+ protocol+'"');

    tasks[name] = loader(cfg, type, name, source);
  });

  return parallel(tasks, function(err, result) {
    if(debug.enabled) {
      if (err) debug("failed to load "+type+": "+list.join());
      else debug("...done loading "+type+": "+list.join());
    }
    callback && callback(err, result);
  });
}

function array(list) {
  if(Array.isArray(list))
    return list;

  return list.split(',');
}

function bind_helpers(ctx){
  var l = load.bind(ctx);
  types.forEach(function(type) {
    l[type] = load.bind(ctx, type);
  });
  return l;
}
