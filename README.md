[![npm version](https://badge.fury.io/js/webpack-shell-plugin.svg)](https://badge.fury.io/js/webpack-shell-plugin)
![](https://reposs.herokuapp.com/?path=1337programming/webpack-shell-plugin)
[![npm](https://img.shields.io/npm/dm/webpack-shell-plugin.svg)]()
# Webpack Shell Plugin

This plugin allows you to run any shell commands before or after webpack builds. This will work for both webpack and webpack-dev-server.

This goes great if you want to run any reporting tools or tests like selenium, protractor, phantom, ect.

## Installation

Just install the plugin

`npm install --save-dev webpack-shell-plugin`

## Setup

Insert into your webpack.config.js:

```js
const WebpackShellPlugin = require('webpack-shell-plugin');

var plugins = [];

plugins.push(new WebpackShellPlugin({
  onBuildStart: ['echo "Starting"'],
  onBuildEnd: ['python script.py && node script.js']
}));

var config = {
  entry: {
    app: __dirname + 'src/app.js'
  },
  output: {
    path: __dirname + 'dest'
  },
  plugins: plugins,
  module: {
    loaders: [
      {test: /\.js$/, loaders: 'babel'},
      {test: /\.scss$/, loader: 'style!css!scss?'},
      {test: /\.html$/, loader: 'html-loader'}
    ]
  }
}

module.exports = config;

```
Once the build finishes, a child process is spawned firing both a python and node script.

### API
* `onBuildStart`: array of scripts to execute on the initial build. **Default: [ ]**
* `onBuildEnd`: array of scripts to execute after files are emitted at the end of the compilation. **Default: [ ]**
* `onBuildExit`: array of scripts to execute after webpack's process is complete. **Default: [ ]**
* `dev`: switch for development environments. This causes scripts to only execute once. Useful for running HMR on webpack-dev-server. **Default: true**
* `verbose`: enable for verbose output. **Default: false**

### Contributions
Yair Tavor
