var exec = require('child_process').exec;

Object.assign = function (target) {
  'use strict';
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var output = Object(target);
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index];
    if (source !== undefined && source !== null) {
      for (var nextKey in source) {
        if (source.hasOwnProperty(nextKey)) {
          output[nextKey] = source[nextKey];
        }
      }
    }
  }
  return output;
};

function puts(error, stdout, stderr) {
  console.log(stdout);
}

function WebpackShellPlugin(options) {
  var defaultOptions = {
    onBuildStart: [],
    onBuildEnd: []
  };
  this.options = Object.assign(defaultOptions, options);

}

WebpackShellPlugin.prototype.apply = function(compiler) {
  const options = this.options;

  compiler.plugin("compilation", function (compilation) {
    if(options.onBuildStart.length){
    console.log("Executing pre-build scripts");
    options.onBuildStart.forEach(function (script) { exec(script, puts)});
  }
});

  compiler.plugin("emit", function (compilation, callback) {
    if(options.onBuildEnd.length){
    console.log("Executing post-build scripts");
    options.onBuildEnd.forEach(function(script){ exec(script, puts)});
  }
  callback();
});
};

module.exports = WebpackShellPlugin;

