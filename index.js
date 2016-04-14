var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
  if (error) {
    console.log('Error: ', error, stderr);
  }
  console.log(stdout);
}

function validateInput(options) {
  if (typeof options.onBuildStart === 'string') {
    options.onBuildStart = options.onBuildStart.split('&&');
  }
  if (typeof options.onBuildEnd === 'string') {
    options.onBuildEnd = options.onBuildEnd.split('&&');
  }
  if (typeof options.onExit === 'string') {
    options.onExit = options.onExit.split('&&');
  }
  return options;
}

function mergeOptions(options, defaults) {
  for (key in defaults) {
    if (options.hasOwnProperty(key)) {
      defaults[key] = options[key];    
    }
  }

  return defaults;
}

function WebpackShellPlugin(options) {
  var defaults = {
    onBuildStart: [],
    onBuildEnd: [],
    onExit: [],
    dev: true,
    verbose: false
  };

  this.options = validateInput(mergeOptions(options, defaults));
}

WebpackShellPlugin.prototype.apply = function (compiler) {
  var options = this.options;

  compiler.plugin('compilation', function (compilation) {
    if (options.verbose) {
      console.log('Report compilation:', compilation);
    }
    if (options.onBuildStart.length) {
      console.log('Executing pre-build scripts');
      options.onBuildStart.forEach(function (script) {
        exec(script, puts);
      });
      if (options.dev) {
        options.onBuildStart = [];
      }
    }
  });

  compiler.plugin('emit', function (compilation, callback) {
    if (options.onBuildEnd.length) {
      console.log('Executing post-build scripts');
      options.onBuildEnd.forEach(function (script) {
        exec(script, puts);
      });
      if (options.dev) {
        options.onBuildEnd = [];
      }
    }
    callback();
  });

  compiler.plugin("done", function () {
    if (options.onExit.length) {
      console.log("Executing addiotn scripts befor exit");
      options.onExit.forEach(function (script) {
        exec(script, puts);
      });
    }
  });
};

module.exports = WebpackShellPlugin;
