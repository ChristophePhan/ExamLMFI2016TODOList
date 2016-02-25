'use strict';

// import libraries
const CfgManager       = require('node-config-manager');
const RequireDirectory = require('require-directory');
const internals        = {}; // Declare internals >> see: http://hapijs.com/styleguide

/* Private properties */
internals._routeDir = '../route';

/**
 * Properties to store config files
 */
internals._pluginCfg = CfgManager.method.Plugin();
internals._routeCfg = CfgManager.method.Route();

/**
 * Plugin Class definition
 */
class Todos {

    constructor(lib, server, options, next) {
        // store lib & options in private global property
        Object.assign(internals, { _lib: lib, _options: options });

        // store end points in options
        Object.assign(internals._options, { endPoints: internals._routeCfg.endPoints });

        // store server object
        Object.assign(internals._lib, { server: server });

        // expose plugin methods
        internals._exposePluginMethods(server, internals._lib, internals._pluginCfg.expose.todos, 'Todos');

        // plugin dependencies
        server.dependency('utils', internals._afterUtils);
        server.dependency('db', internals._afterDb);

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

    server.log(['debug'], 'START < Todos.internals._exposePluginMethods >');

    if (config && config instanceof Array) {
        // create object to expose
        const ObjToExpose = {};

        config.forEach((method) => {

            if (obj[method]) {
                server.log(['debug'], '< Todos.internals._exposePluginMethods > Method `' + method + '` exists for plugin `' + pluginName + '`');

                ObjToExpose[method] = obj[method];
            }
            else {
                server.log(['debug'], '< Todos.internals._exposePluginMethods > Method `' + method + '` doesn\'t exist for plugin `' + pluginName + '`');
            }
        });

        // expose required methods for plugin
        ['server'].forEach((method) => {

            if (!ObjToExpose[method]) {
                if (!obj[method]) {
                    throw new ReferenceError('Missing required method `' + method + '` for plugin `' + pluginName + '`');
                }

                server.log(['debug'], '< Todos.internals._exposePluginMethods > Method `' + method + '` exists for plugin `' + pluginName + '`');

                // add method
                ObjToExpose[method] = obj[method];
            }
            else {
                server.log(['debug'], '< Todos.internals._exposePluginMethods > Method `' + method + '` is already exposed for plugin `' + pluginName + '`');
            }
        });

        // check if object has some methods to expose these
        if (Object.keys(ObjToExpose).length > 0) {
            server.log(['debug'], '< Todos.internals._exposePluginMethods > Plugin `' + pluginName + '` has some methods to be exposed => ' +
                JSON.stringify(Object.keys(ObjToExpose)));

            Object.keys(ObjToExpose).forEach((key) => server.expose(key, ObjToExpose[key]));
        }
        else {
            server.log(['debug'], '< Todos.internals._exposePluginMethods > Plugin `' + pluginName + '` has no methods to be exposed');
        }
    }
    else {
        server.log(['debug'], '< Todos.internals._exposePluginMethods > Plugin `' + pluginName + '` has no methods to be exposed');
    }

    server.log(['debug'], 'END < Todos.internals._exposePluginMethods >');
};

/**
 * Function after {Utils} plugin registration
 *
 * @param server - HapiJS server instance in this plugin
 * @param next - Callback method
 * @private
 */
internals._afterUtils = (server, next) => {

    server.log(['debug'], 'START < Todos.internals._afterUtils >');

    // store plugin object
    Object.assign(internals._lib, { utils: server.plugins.utils });

    server.log(['debug'], '< Todos.internals._afterUtils > Store plugin in Lib');

    // set schema in options
    Object.assign(internals._options, { schema: internals._lib.utils.schema });

    server.log(['debug'], '< Todos.internals._afterUtils > Store schema in options for routes');

    // load routes
    internals._registerRoutes(server, internals._lib, internals._options, internals._routeDir);

    server.log(['debug'], 'END < Todos.internals._afterUtils >');

    next();
};

/**
 * Function after {Db} plugin registration
 *
 * @param server - HapiJS server instance in this plugin
 * @param next - Callback method
 * @private
 */
internals._afterDb = (server, next) => {

    server.log(['debug'], 'START < Todos.internals._afterDb >');

    // store plugin object
    Object.assign(internals._lib, { db: server.plugins.db });

    server.log(['debug'], '< Todos.internals._afterDb > Store plugin in Lib');

    server.log(['debug'], 'END < Todos.internals._afterDb >');

    next();
};

/**
 * Function to register server routes - Recursive method
 *
 * @param server - HapiJS server instance in this plugin
 * @param lib - Lib instance
 * @param options - Options object to pass to each route instance
 * @param path - Path to find new routes
 * @private
 */
internals._registerRoutes = (server, lib, options, path) => {

    // routes folder
    const routes = RequireDirectory(module, path);

    if (routes) {
        server.log(['debug'], '< Todos.internals._registerRoutes > New routes folder found in "' + path + '"');

        for (const route in routes) {
            try {
                server.route(new routes[route](lib, options).definition());
                server.log(['debug'], '< Todos.internals._registerRoutes > Route "' + route + '" in "' + path + '" - OK');
            }
            catch (e) {
                server.log(['debug'], '< Todos.internals._registerRoutes > "' + route + '" is not a valid route - May be a folder');
                internals._registerRoutes(server, lib, options, path + '/'+ route);
            }
        }
    }
    else {
        server.log(['debug'], '< Todos.internals._registerRoutes > No routes found in "' + path + '" folder');
    }
};

/**
 * Export class
 *
 * @type {Todos}
 */
module.exports = Todos;
