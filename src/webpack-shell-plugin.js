const exec = require('child_process').exec;
const defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  dev: true,
  verbose: false,
  throwOnExecError: false
};

function puts(error, stdout, stderr) {
  if (error) {
    console.log('Error: ', error, stderr);
  }
}

function putsThrow(error, stdout, stderr) {
  if (error) {
    throw error;
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
        this.options.onBuildStart.forEach((script) => {
          if (this.options.throwOnExecError) {
            spreadStdoutAndStdErr(exec(script, putsThrow));
          }
          else {
            spreadStdoutAndStdErr(exec(script, puts));
          }
        });
        if (this.options.dev) {
          this.options.onBuildStart = [];
        }
      }
    });

    compiler.plugin('emit', (compilation, callback) => {
      if (this.options.onBuildEnd.length) {
        console.log('Executing post-build scripts');
        this.options.onBuildEnd.forEach((script) => {
          if (this.options.throwOnExecError) {
            spreadStdoutAndStdErr(exec(script, putsThrow));
          }
          else {
            spreadStdoutAndStdErr(exec(script, puts));
          }
        });
        if (this.options.dev) {
          this.options.onBuildEnd = [];
        }
      }
      callback();
    });

    compiler.plugin('done', () => {
      if (this.options.onBuildExit.length) {
        console.log('Executing additional scripts before exit');
        this.options.onBuildExit.forEach((script) => {
          if (this.options.throwOnExecError) {
            spreadStdoutAndStdErr(exec(script, putsThrow));
          }
          else {
            spreadStdoutAndStdErr(exec(script, puts));
          }
        });
      }
    });
  }
}
