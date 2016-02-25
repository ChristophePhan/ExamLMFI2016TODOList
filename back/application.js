/* See LICENSE file for terms of use */
'use strict';

// import libraries
const Hapi             = require('hapi');
const RequireDirectory = require('require-directory');
const Async            = require('async');
const Good             = require('good');
const Hoek             = require('hoek');
const CfgManager       = require('node-config-manager');
const internals        = {}; // Declare internals >> see: http://hapijs.com/styleguide

/** Private properties **/
internals._defaultEnv = 'development';
internals._libDir = './lib/';
internals._configDir = './config';
internals._configs = ['api', 'good', 'route', 'plugin', 'mongo', 'dao'];
internals._instance = null;

/**
 * Function to register Good plugin
 *
 * @param server - HapiJS server instance
 * @param cfg - Plugin cfg
 * @param callback - callback method
 * @private
 */
internals._registerGoodPlugin = (server, cfg, callback) => {

    // check variables
    Hoek.assert(server, 'server are required to register plugins'); // pre-auth checks
    Hoek.assert(cfg, 'cfg are required to register plugins'); // pre-auth checks

    Hoek.assert(cfg.good, 'cfg must contain good value to have good configuration'); // no configuration

    server.register(
        {
            register: Good,
            options: cfg.good
        },
        (err) => {

            callback(err);
        }
    );
};

/**
 * Function to register custom plugins
 *
 * @param server - HapiJS server instance
 * @param cfg - Plugins cfg
 * @param callback - callback method
 * @private
 */
internals._registerPlugins = (server, cfg, callback) => {

    // check variables
    Hoek.assert(server, 'server are required to register plugins'); // pre-auth checks
    Hoek.assert(cfg, 'cfg are required to register plugins'); // pre-auth checks

    Hoek.assert(cfg.plugin, 'cfg must contain plugin value to have good configuration'); // no configuration

    Hoek.assert(cfg.route, 'cfg must contain route value to have good configuration'); // no configuration

    Hoek.assert(cfg.libDir, 'cfg must contain libDir value to have good configuration'); // no configuration

    Hoek.assert(cfg.plugin.pluginsWithoutApiPrefix, 'plugin cfg must contain pluginsWithoutApiPrefix value to have good configuration'); // no configuration

    Hoek.assert(cfg.route.apiPath, 'route cfg must contain apiPath value to have good configuration'); // no configuration
    Hoek.assert(cfg.route.apiVersion, 'route cfg must contain apiVersion value to have good configuration'); // no configuration

    // global variables
    const pluginsDir = cfg.libDir;
    const plugins = RequireDirectory(module, pluginsDir);
    const registers = [];
    const registersWithApiPrefix = [];

    // for each plugins
    Async.each(Object.keys(plugins),
        (plugin, cb) => {

            // default options
            const options = {};

            // check if plugin must have api prefix
            if (Hoek.contain(cfg.plugin.pluginsWithoutApiPrefix, plugin)) {
                // add plugin to register array
                registers.push({
                    register: require(pluginsDir + plugin),
                    options: options
                });
            }
            else {
                // add plugin to register array
                registersWithApiPrefix.push({
                    register: require(pluginsDir + plugin),
                    options: options
                });
            }

            cb();
        },
        () => {

            Async.parallel(
                [
                    (cb) => {

                        // register all plugins with api prefix
                        server.register(registersWithApiPrefix, { routes: { prefix: cfg.route.apiPath + cfg.route.apiVersion } }, cb);
                    },
                    (cb) => {

                        // register all plugins without prefix
                        server.register(registers, cb);

                    }
                ],
                (err) => {

                    callback(err);
                }
            );
        }
    );
};

/**
 * Application Class definition
 */
class Application {

    // constructor
    constructor(){

        // Create hapi server instance
        this._server = new Hapi.Server();
    }

    /**
     * Method to return HapiJS server instance
     *
     * @returns {*} instance of HapiJS server
     */
    get server() {

        return this._server;
    }

    /**
     * Method to set HapiJS server instance
     *
     * @params {*} instance of HapiJS server
     */
    set server(value) {

        this._server = value;

    }

    /**
     * Function to launch application
     */
    launch(callback) {

        // load config
        CfgManager.init({
            env: process.env.NODE_ENV || internals._defaultEnv,
            configDir: internals._configDir,
            camelCase: true
        });

        // add config files
        internals._configs.forEach((config) => {

            CfgManager.addConfig(config);
        });

        // adding a new connection that can be listened on
        this.server.connection(CfgManager.method.Api());

        // load plugins
        Async.series(
            [
                (cb) => {

                    // register log before all plugins
                    internals._registerGoodPlugin(this.server, { good: CfgManager.method.Good() }, cb);
                },
                (cb) => {

                    // register all plugins
                    internals._registerPlugins(this.server,
                        { route: CfgManager.method.Route(), plugin: CfgManager.method.Plugin(), libDir: internals._libDir }, cb);

                }
            ],
            (err) => {

                // check if error occurred during plugins registration
                if (err) {
                    throw err;
                }

                this.server.start((err) => {

                    // check if error occurred during server starting
                    if (err) {
                        throw err;
                    }

                    this.server.log(['info'], '< Application.launch > Plugins registered with success');

                    this.server.log(['info'], '< Application.launch > Server started at: ' + this.server.info.uri);

                    // callback for unit test
                    if (callback) {
                        callback();
                    }
                });
            });
    }

    /**
     * Returns singleton instance
     *
     * @returns {null|Application|*}
     */
    static getInstance() {

        // singleton
        if (!(internals._instance instanceof Application)) {
            internals._instance = new Application();
        }

        return internals._instance;
    }
}

/**
 * Export Application class
 *
 * @type {Application}
 */
module.exports = Application;
