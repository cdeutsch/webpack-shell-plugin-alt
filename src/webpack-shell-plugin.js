const spawn = require('child_process').spawn;
const defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  dev: true,
  verbose: false
};

function puts(error, stdout, stderr) {
  if (error) {
    throw error;
  }
}

function serializeScript(script) {
  if (typeof script === 'string') {
    const [command, ...args] = script.split(' ');
    return {command, args};
  }
  const {command, args} = script;
  return {command, args};
}

function handleScript(script) {
  const {command, args} = serializeScript(script);
  const proc = spawn(command, args, {stdio: 'inherit'});
  proc.on('close', puts);
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
  for (const key in defaults) {
    if (options.hasOwnProperty(key)) {
      defaults[key] = options[key];
    }
  }
  return defaults;
}

export default class WebpackShellPlugin {
  constructor(options) {
    this.options = validateInput(mergeOptions(options, defaultOptions));
  }

  apply(compiler) {

    compiler.plugin('compilation', (compilation) => {
      if (this.options.verbose) {
        console.log(`Report compilation: ${compilation}`);
      }
      if (this.options.onBuildStart.length) {
        console.log('Executing pre-build scripts');
        this.options.onBuildStart.forEach(handleScript);
        if (this.options.dev) {
          this.options.onBuildStart = [];
        }
      }
    });

    compiler.plugin('emit', (compilation, callback) => {
      if (this.options.onBuildEnd.length) {
        console.log('Executing post-build scripts');
        this.options.onBuildEnd.forEach(handleScript);
        if (this.options.dev) {
          this.options.onBuildEnd = [];
        }
      }
      callback();
    });

    compiler.plugin('done', () => {
      if (this.options.onBuildExit.length) {
        console.log('Executing additional scripts before exit');
        this.options.onBuildExit.forEach(handleScript);
      }
    });
  }
}
