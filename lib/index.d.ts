import { Plugin } from "webpack";

export = WebpackShellPlugin;

declare class WebpackShellPlugin extends Plugin {
  constructor(options?: WebpackShellPlugin.Options);
}

declare namespace WebpackShellPlugin {
  interface Options {
    /** Scripts to execute on the initial build. Defaults to []. */
    onBuildStart?: string[];

    /**
     * Scripts to execute after files are emitted at the end of the
     * compilation. Defaults to [].
     */
    onBuildEnd?: string[];

    /** Scripts to execute after Webpack's process completes. Defaults to []. */
    onBuildExit?: string[];

    /** Scripts to execute on every Webpack compile. Defaults to []. */
    onCompile?: string[];

    /**
     * Switch for development environments. This causes scripts to execute once.
     * Useful for running HMR on webpack-dev-server or webpack watch mode.
     * Defaults to true.
     */
    dev?: boolean;

    /**
     * Switches script execution process from spawn to exec. If running into
     * problems with spawn, turn this setting on. Defaults to false.
     */
    safe?: boolean;

    /** DEPRECATED. Enable for verbose output. Defaults to false. */
    verbose?: boolean;
  }
}
