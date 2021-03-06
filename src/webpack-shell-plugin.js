const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const os = require('os');

const defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  onCompile: [],
  dev: true,
  verbose: false,
  safe: false
};

export default class WebpackShellPlugin {
  constructor(options) {
    this.options = this.validateInput(this.mergeOptions(options, defaultOptions));
  }

  puts(error) {
    if (error) {
      throw error;
    }
  }

  spreadStdoutAndStdErr(proc) {
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stdout);
  }

  serializeScript(script) {
    if (typeof script === 'string') {
      const [command, ...args] = script.split(' ');
      return {command, args};
    }
    const {command, args} = script;
    return {command, args};
  }

  handleScript(script) {
    if (os.platform() === 'win32' || this.options.safe) {
      this.spreadStdoutAndStdErr(exec(script, this.puts));
    } else {
      const {command, args} = this.serializeScript(script);
      const proc = spawn(command, args, {stdio: 'inherit'});
      proc.on('close', this.puts);
    }
  }

  validateInput(options) {
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

  mergeOptions(options, defaults) {
    for (const key in defaults) {
      // eslint-disable-next-line no-prototype-builtins
      if (options.hasOwnProperty(key)) {
        defaults[key] = options[key];
      }
    }
    return defaults;
  }

  apply(compiler) {

    compiler.hooks.compilation.tap('WebpackShellPlugin', (compilation) => {
      if (this.options.verbose) {
        console.log(`Report compilation: ${compilation}`);
        console.warn(`WebpackShellPlugin [${new Date()}]: Verbose is being deprecated, please remove.`);
      }
      if (this.options.onBuildStart.length) {
        console.log('Executing pre-build scripts');
        for (let ii = 0; ii < this.options.onBuildStart.length; ii += 1) {
          this.handleScript(this.options.onBuildStart[ii]);
        }
        if (this.options.dev) {
          this.options.onBuildStart = [];
        }
      }
    });

    compiler.hooks.watchRun.tap('WebpackShellPlugin', () => {
      if (this.options.onCompile.length) {
        console.log('Executing compile scripts');
        for (let ii = 0; ii < this.options.onCompile.length; ii += 1) {
          this.handleScript(this.options.onCompile[ii]);
        }
      }
    });

    compiler.hooks.afterEmit.tapAsync('WebpackShellPlugin', (compilation, callback) => {
      if (this.options.onBuildEnd.length) {
        console.log('Executing post-build scripts');
        for (let ii = 0; ii < this.options.onBuildEnd.length; ii += 1) {
          this.handleScript(this.options.onBuildEnd[ii]);
        }
        if (this.options.dev) {
          this.options.onBuildEnd = [];
        }
      }
      callback();
    });

    compiler.hooks.done.tap('WebpackShellPlugin', () => {
      if (this.options.onBuildExit.length) {
        console.log('Executing additional scripts before exit');
        for (let ii = 0; ii < this.options.onBuildExit.length; ii += 1) {
          this.handleScript(this.options.onBuildExit[ii]);
        }
      }
    });
  }
}
