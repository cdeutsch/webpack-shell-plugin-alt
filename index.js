var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
  console.log(stdout);
}

function WebpackShellPlugin(options) {
  var defaultOptions = {
    onBuildStart: [],
    onBuildEnd: []
  };
  if (!options.onBuildStart) {
    options.onBuildStart = defaultOptions.onBuildStart;
  }

  if(!options.onBuildEnd) {
    options.onBuildEnd = defaultOptions.onBuildEnd;
  }

  this.options = options;

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

