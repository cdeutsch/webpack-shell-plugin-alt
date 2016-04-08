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

function WebpackShellPlugin(options) {
  var defaultOptions = {
    onBuildStart: [],
    onBuildEnd: [],
    onExit: [],
    dev: true,
    verbose: false
  };

  if (!options.onBuildStart) {
    options.onBuildStart = defaultOptions.onBuildStart;
  }

  if (!options.onBuildEnd) {
    options.onBuildEnd = defaultOptions.onBuildEnd;
  }

  if (!options.onExit) {
    options.onExit = defaultOptions.onExit;
  }

  if (!options.dev) {
    options.dev = defaultOptions.dev;
  }

  if (!options.verbose) {
    options.verbose = defaultOptions.verbose;
  }

  options = validateInput(options);

  this.options = options;

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
