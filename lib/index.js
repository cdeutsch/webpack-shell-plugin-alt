'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var spawn = require('child_process').spawn;

var exec = require('child_process').exec;

var os = require('os');

var defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  onCompile: [],
  dev: true,
  verbose: false,
  safe: false
};

var WebpackShellPlugin =
/*#__PURE__*/
function () {
  function WebpackShellPlugin(options) {
    _classCallCheck(this, WebpackShellPlugin);

    this.options = this.validateInput(this.mergeOptions(options, defaultOptions));
  }

  _createClass(WebpackShellPlugin, [{
    key: "puts",
    value: function puts(error) {
      if (error) {
        throw error;
      }
    }
  }, {
    key: "spreadStdoutAndStdErr",
    value: function spreadStdoutAndStdErr(proc) {
      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stdout);
    }
  }, {
    key: "serializeScript",
    value: function serializeScript(script) {
      if (typeof script === 'string') {
        var _script$split = script.split(' '),
            _script$split2 = _toArray(_script$split),
            _command = _script$split2[0],
            _args = _script$split2.slice(1);

        return {
          command: _command,
          args: _args
        };
      }

      var command = script.command,
          args = script.args;
      return {
        command: command,
        args: args
      };
    }
  }, {
    key: "handleScript",
    value: function handleScript(script) {
      if (os.platform() === 'win32' || this.options.safe) {
        this.spreadStdoutAndStdErr(exec(script, this.puts));
      } else {
        var _this$serializeScript = this.serializeScript(script),
            command = _this$serializeScript.command,
            args = _this$serializeScript.args;

        var proc = spawn(command, args, {
          stdio: 'inherit'
        });
        proc.on('close', this.puts);
      }
    }
  }, {
    key: "validateInput",
    value: function validateInput(options) {
      if (typeof options.onBuildStart === 'string') {
        options.onBuildStart = options.onBuildStart.split('&&');
      }

      if (typeof options.onBuildEnd === 'string') {
        options.onBuildEnd = options.onBuildEnd.split('&&');
      }

      if (typeof options.onBuildExit === 'string') {
        options.onBuildExit = options.onBuildExit.split('&&');
      }

      if (typeof options.onCompile === 'string') {
        options.onCompile = options.onCompile.split('&&');
      }

      return options;
    }
  }, {
    key: "mergeOptions",
    value: function mergeOptions(options, defaults) {
      for (var key in defaults) {
        // eslint-disable-next-line no-prototype-builtins
        if (options.hasOwnProperty(key)) {
          defaults[key] = options[key];
        }
      }

      return defaults;
    }
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.compilation.tap('WebpackShellPlugin', function (compilation) {
        if (_this.options.verbose) {
          console.log("Report compilation: ".concat(compilation));
          console.warn("WebpackShellPlugin [".concat(new Date(), "]: Verbose is being deprecated, please remove."));
        }

        if (_this.options.onBuildStart.length) {
          console.log('Executing pre-build scripts');

          for (var ii = 0; ii < _this.options.onBuildStart.length; ii += 1) {
            _this.handleScript(_this.options.onBuildStart[ii]);
          }

          if (_this.options.dev) {
            _this.options.onBuildStart = [];
          }
        }
      });
      compiler.hooks.watchRun.tap('WebpackShellPlugin', function () {
        if (_this.options.onCompile.length) {
          console.log('Executing compile scripts');

          for (var ii = 0; ii < _this.options.onCompile.length; ii += 1) {
            _this.handleScript(_this.options.onCompile[ii]);
          }
        }
      });
      compiler.hooks.afterEmit.tapAsync('WebpackShellPlugin', function (compilation, callback) {
        if (_this.options.onBuildEnd.length) {
          console.log('Executing post-build scripts');

          for (var ii = 0; ii < _this.options.onBuildEnd.length; ii += 1) {
            _this.handleScript(_this.options.onBuildEnd[ii]);
          }

          if (_this.options.dev) {
            _this.options.onBuildEnd = [];
          }
        }

        callback();
      });
      compiler.hooks.done.tap('WebpackShellPlugin', function () {
        if (_this.options.onBuildExit.length) {
          console.log('Executing additional scripts before exit');

          for (var ii = 0; ii < _this.options.onBuildExit.length; ii += 1) {
            _this.handleScript(_this.options.onBuildExit[ii]);
          }
        }
      });
    }
  }]);

  return WebpackShellPlugin;
}();

module.exports = WebpackShellPlugin;
