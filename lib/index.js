'use strict';

var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers;

var exec = require('child_process').exec;
var defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  dev: true,
  verbose: false
};

function puts(error, stdout, stderr) {
  if (error) {
    console.log('Error: ', error, stderr);
  }
}

function spreadStdoutAndStdErr(proc) {
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stdout);
}

function validateInput(options) {
  if (typeof options.onBuildStart === 'string') {
    options.onBuildStart = options.onBuildStart.split('&&');
  }
  if (typeof options.onBuildEnd === 'string') {
    options.onBuildEnd = options.onBuildEnd.split('&&');
  }
  if (typeof options.onBuildExit === 'string') {
    options.onBuildExit = options.onBuildExit.split('&&');
  }
  return options;
}

function mergeOptions(options, defaults) {
  for (var key in defaults) {
    if (options.hasOwnProperty(key)) {
      defaults[key] = options[key];
    }
  }
  return defaults;
}

var WebpackShellPlugin = function () {
  function WebpackShellPlugin(options) {
    babelHelpers.classCallCheck(this, WebpackShellPlugin);

    this.options = validateInput(mergeOptions(options, defaultOptions));
  }

  babelHelpers.createClass(WebpackShellPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('compilation', function (compilation) {
        if (_this.options.verbose) {
          console.log('Report compilation: ' + compilation);
        }
        if (_this.options.onBuildStart.length) {
          console.log('Executing pre-build scripts');
          _this.options.onBuildStart.forEach(function (script) {
            spreadStdoutAndStdErr(exec(script, puts));
          });
          if (_this.options.dev) {
            _this.options.onBuildStart = [];
          }
        }
      });

      compiler.plugin('emit', function (compilation, callback) {
        if (_this.options.onBuildEnd.length) {
          console.log('Executing post-build scripts');
          _this.options.onBuildEnd.forEach(function (script) {
            spreadStdoutAndStdErr(exec(script, puts));
          });
          if (_this.options.dev) {
            _this.options.onBuildEnd = [];
          }
        }
        callback();
      });

      compiler.plugin('done', function () {
        if (_this.options.onBuildExit.length) {
          console.log('Executing additional scripts before exit');
          _this.options.onBuildExit.forEach(function (script) {
            spreadStdoutAndStdErr(exec(script, puts));
          });
        }
      });
    }
  }]);
  return WebpackShellPlugin;
}();

module.exports = WebpackShellPlugin;