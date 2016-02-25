'use strict';

// import libraries
const CfgManager  = require('node-config-manager');
const Hoek        = require('hoek');
const internals   = {}; // Declare internals >> see: http://hapijs.com/styleguide

/**
 * Properties to store config files
 */
internals._pluginCfg = CfgManager.method.Plugin();
internals._routeCfg = CfgManager.method.Route();

/* Private properties */
internals._portRequireForEnv = ['development', 'package'];

/**
 * Plugin Class definition
 */
class Utils {

    constructor(lib, server, options, next) {
        // check config
        Hoek.assert(internals._pluginCfg, 'internals must contain _pluginCfg value to have good configuration'); // no configuration
        Hoek.assert(internals._pluginCfg.expose, '_pluginCfg must contain expose value to have good configuration'); // no configuration
        Hoek.assert(internals._pluginCfg.expose.utils, 'expose must contain utils value to have good configuration'); // no configuration
        Hoek.assert(internals._pluginCfg.expose.utils instanceof Array, 'utils must be an array to have good configuration'); // no configuration

        Hoek.assert(internals._portRequireForEnv, 'internals must contain _portRequireForEnv value to have good configuration'); // no configuration
        Hoek.assert(internals._portRequireForEnv instanceof Array, '_portRequireForEnv must be an array to have good configuration'); // no configuration

        Hoek.assert(internals._routeCfg, 'internals must contain _routeCfg value to have good configuration'); // no configuration
        Hoek.assert(internals._routeCfg.protocol, '_routeCfg must contain protocol value to have good configuration'); // no configuration
        Hoek.assert(internals._routeCfg.host, '_routeCfg must contain host value to have good configuration'); // no configuration
        Hoek.assert(internals._routeCfg.apiPath, '_routeCfg must contain apiPath value to have good configuration'); // no configuration
        Hoek.assert(internals._routeCfg.apiVersion, '_routeCfg must contain apiVersion value to have good configuration'); // no configuration
        if (Hoek.contain(internals._portRequireForEnv, CfgManager.get('env'))) {
            Hoek.assert(internals._routeCfg.port, '_routeCfg must contain port value to have good configuration'); // no configuration
        }
        Hoek.assert(internals._routeCfg.endPoints, '_routeCfg must contain endPoints value to have good configuration'); // no configuration

        // store lib & options in private global property
        Object.assign(internals, { _lib: lib, _options: options });

        // store server object
        Object.assign(internals._lib, { server: server });

        // expose plugin methods
        internals._exposePluginMethods(server, internals._lib, internals._pluginCfg.expose.utils, 'Utils');

        next();
    }
}

/**
 * Function to expose plugin methods with configuration file
 *
 * @param server - HapiJS server instance in this plugin
 * @param obj - Object where methods are implemented
 * @param config - List of methods to expose
 * @param pluginName - Plugin name for log
 * @private
 */
internals._exposePluginMethods = (server, obj, config, pluginName) => {

    server.log(['debug'], 'START < Utils.internals._exposePluginMethods >');

    if (config && config instanceof Array) {
        // create object to expose
        const ObjToExpose = {};

        config.forEach((method) => {

            if (obj[method]) {
                server.log(['debug'], '< Utils.internals._exposePluginMethods > Method `' + method + '` exists for plugin `' + pluginName + '`');

                ObjToExpose[method] = obj[method];
            }
            else {
                server.log(['debug'], '< Utils.internals._exposePluginMethods > Method `' + method + '` doesn\'t exist for plugin `' + pluginName + '`');
            }
        });

        // expose required methods for plugin
        ['server'].forEach((method) => {

            if (!ObjToExpose[method]) {
                if (!obj[method]) {
                    throw new ReferenceError('Missing required method `' + method + '` for plugin `' + pluginName + '`');
                }

                server.log(['debug'], '< Utils.internals._exposePluginMethods > Method `' + method + '` exists for plugin `' + pluginName + '`');

                // add method
                ObjToExpose[method] = obj[method];
            }
            else {
                server.log(['debug'], '< Utils.internals._exposePluginMethods > Method `' + method + '` is already exposed for plugin `' + pluginName + '`');
            }
        });

        // check if object has some methods to expose these
        if (Object.keys(ObjToExpose).length > 0) {
            server.log(['debug'], '< Utils.internals._exposePluginMethods > Plugin `' + pluginName + '` has some methods to be exposed => ' +
                JSON.stringify(Object.keys(ObjToExpose)));

            Object.keys(ObjToExpose).forEach((key) => server.expose(key, ObjToExpose[key]));
        }
        else {
            server.log(['debug'], '< Utils.internals._exposePluginMethods > Plugin `' + pluginName + '` has no methods to be exposed');
        }
    }
    else {
        server.log(['debug'], '< Utils.internals._exposePluginMethods > Plugin `' + pluginName + '` has no methods to be exposed');
    }

    server.log(['debug'], 'END < Utils.internals._exposePluginMethods >');
};

/**
 * Export class
 *
 * @type {Utils}
 */
module.exports = Utils;
