'use strict';

// import libraries
const CfgManager       = require('node-config-manager');
const Hoek             = require('hoek');
const Path             = require('path');
const RequireDirectory = require('require-directory');
const internals        = {}; // Declare internals >> see: http://hapijs.com/styleguide

/**
 * Properties to store config files
 */
internals._daoCfg = CfgManager.method.Dao();

/* Private properties */
internals._dao = {};
internals._daoDir = '../dao';
internals._modelsDir = '../models';

/**
 * Plugin Class definition
 */
class Db {

    constructor(HapiMongoModels, mongoCfg, server, options, next) {
        // check config
        Hoek.assert(internals, 'internals are required for db'); // pre-auth checks
        Hoek.assert(internals._dao, 'internals must contain _dao value to have good configuration'); // no configuration
        Hoek.assert(internals._daoDir, 'internals must contain _daoDir value to have good configuration'); // no configuration
        Hoek.assert(internals._modelsDir, 'internals must contain _modelsDir value to have good configuration'); // no configuration

        Hoek.assert(internals._daoCfg, 'internals must contain _daoCfg value to have good configuration'); // no configuration
        Hoek.assert(internals._daoCfg.expose, '_daoCfg must contain expose value to have good configuration'); // no configuration
        Hoek.assert(internals._daoCfg.errorCodeMongoToHTTP, '_daoCfg must contain errorCodeMongoToHTTP value to have good configuration'); // no configuration

        Hoek.assert(HapiMongoModels, 'parameters must contain HapiMongoModels value to have good configuration'); // no configuration

        Hoek.assert(mongoCfg, 'parameters must contain mongoCfg value to have good configuration'); // no configuration
        Hoek.assert(mongoCfg.host, 'mongoCfg must contain host value to have good configuration'); // no configuration
        Hoek.assert(mongoCfg.port, 'mongoCfg must contain host value to have good configuration'); // no configuration
        Hoek.assert(mongoCfg.database, 'mongoCfg must contain database value to have good configuration'); // no configuration
        Hoek.assert(mongoCfg.autoIndex, 'mongoCfg must contain autoIndex value to have good configuration'); // no configuration
        Hoek.assert(mongoCfg.options, 'mongoCfg must contain options value to have good configuration'); // no configuration

        // register daos
        internals._registerDaos(server, internals._daoDir);

        // register hapi-mongo-models plugin
        internals._registerHapiMongoModels(HapiMongoModels, mongoCfg, server, next);

        // server dependencies
        server.dependency('hapi-mongo-models', internals._afterHapiMongoModels);
    }
}

/**
 * Function to register hapi-mongo-models plugin
 *
 * @param server - HapiJS server instance in this plugin
 * @param next - callback function
 * @private
 */
internals._registerHapiMongoModels = (HapiMongoModels, mongoCfg, server, next) => {

    server.log(['debug'], 'START < db.internals._registerHapiMongoModels >');

    // mongo url
    let url = 'mongodb://';

    // check if credentials are required
    if (mongoCfg.user && mongoCfg.password) {
        url += mongoCfg.user + ':' + mongoCfg.password + '@';
    }

    // end of url
    url += mongoCfg.host + ':' + mongoCfg.port + '/' + mongoCfg.database;

    server.log(['debug'], '< db.internals._registerHapiMongoModels > Mongo URL => ' + url);

    // register plugin
    server.register(
        {
            register: HapiMongoModels,
            options: {
                mongodb: {
                    url: url,
                    options: mongoCfg.options
                },
                autoIndex: mongoCfg.autoIndex.value,
                models: internals._registerModels(server, internals._modelsDir)
            }
        },
        (err) => {

            if (err) {
                server.log(['info'], 'An error occurred :');
                server.log(['error'], err);
                server.log(['debug'], 'END < db.internals._registerHapiMongoModels > with error');

                return next(err);
            }

            server.log(['debug'], 'END < db.internals._registerHapiMongoModels >');

            next();
        }
    );
};

/**
 * Function to build object contains models' path
 *
 * @param server - HapiJS server instance in this plugin
 * @param path - Path to find new models
 * @returns {{}}
 * @private
 */
internals._registerModels = (server, path) => {

    server.log(['debug'], 'START < db.internals._registerModels >');

    // initialize variables
    const m = {};
    const models = RequireDirectory(module, path);

    if (models) {
        server.log(['debug'], '< db.internals._registerModels > New models folder found in "' + path + '"');

        for (const model in models) {
            m[model] = Path.join(Path.join(__dirname, path), model);
            server.log(['debug'], '< db.internals._registerModels > Model "' + model + '" in "' + path + '" - OK');
        }
    }
    else {
        server.log(['debug'], '< db.internals._registerModels > No models found in "' + path + '" folder');
    }

    server.log(['debug'], 'END < db.internals._registerModels >');

    return m;
};

/**
 * Function to create and store each dao instance
 *
 * @param server - HapiJS server instance in this plugin
 * @param path - Path to find new dao
 * @private
 */
internals._registerDaos = (server, path) => {

    server.log(['debug'], 'START < db.internals._registerDaos >');

    // dao folder
    const daos = RequireDirectory(module, path);

    if (daos) {
        server.log(['debug'], '< db.internals._registerDaos > New daos found in "' + path + '" folder');

        for (const dao in daos) {
            // get Dao class
            const Dao = require(Path.join(Path.join(__dirname, path), dao));

            // store singleton instance of Dao
            internals._dao[dao] = Dao.getInstance();

            server.log(['debug'], '< db.internals._registerDaos > Dao "' + dao + '" in "' + path + '" - OK');

            // store server object
            Object.assign(internals._dao[dao], { server: server });
        }
    }
    else {
        server.log(['debug'], '< db.internals._registerDaos > No daos found in "' + path + '" folder');
    }

    server.log(['debug'], 'END < db.internals._registerDaos >');
};

/**
 * Function to expose all daos' methods describe in configuration file
 *
 * @param server - HapiJS server instance in this plugin
 * @private
 */
internals._exposeDao = (server) => {

    server.log(['debug'], 'START < db.internals._exposeDao >');

    // for each elements to expose
    Object.keys(internals._daoCfg.expose).forEach((dao) => {

        // check if dao exists
        if (internals._dao[dao]) {
            server.log(['debug'], '< db.internals._exposeDao > Dao `' + dao + '` exists');

            // create object to expose
            const ObjToExpose = {};

            // for each methods in dao
            internals._daoCfg.expose[dao].forEach((method) => {

                // check if method exists in dao
                if (internals._dao[dao][method]) {
                    server.log(['debug'], '< db.internals._exposeDao > Dao `' + dao + '` has method `' + method + '`');

                    // add method
                    ObjToExpose[method] = internals._dao[dao][method];
                }
                else {
                    server.log(['debug'], '< db.internals._exposeDao > Dao `' + dao + '` doesn\'t have method `' + method + '`');
                }
            });

            // expose required methods for dao
            ['server', 'model', 'name'].forEach((method) => {

                if (!ObjToExpose[method]) {
                    if (!internals._dao[dao][method]) {
                        throw new ReferenceError('Missing required method `' + method + '` for Dao `' + dao + '`');
                    }

                    server.log(['debug'], '< db.internals._exposeDao > Dao `' + dao + '` has method `' + method + '`');

                    // add method
                    ObjToExpose[method] = internals._dao[dao][method];
                }
                else {
                    server.log(['debug'], '< db.internals._exposeDao > Method `' + method + '` is already exposed for Dao `' + dao + '`');
                }
            });

            // check if object has some methods to expose these
            if (Object.keys(ObjToExpose).length > 0) {
                server.log(['debug'], '< db.internals._exposeDao > Dao `' + dao +
                    '` has some methods to be exposed => ' + JSON.stringify(Object.keys(ObjToExpose)));

                server.expose(dao, ObjToExpose);
            }
            else {
                server.log(['debug'], '< db.internals._exposeDao > Dao `' + dao + '` has no methods to be exposed');
            }
        }
        else {
            server.log(['debug'], '< db.internals._exposeDao > Dao `' + dao + '` doesn\'t exist');
        }
    });

    server.log(['debug'], 'END < db.internals._exposeDao >');
};

/**
 * Function after {HapiMongoModels} plugin registration
 * Store registered models in associated Daos
 *
 * @param server - HapiJS server instance in this plugin
 * @param next - callback function
 * @private
 */
internals._afterHapiMongoModels = (server, next) => {

    server.log(['debug'], 'START < db.internals._afterHapiMongoModels >');

    // get plugin
    const hapiMongoModels = server.plugins['hapi-mongo-models'];

    if (hapiMongoModels) {
        // set model in associated dao
        Object.keys(internals._dao).forEach((key) => {

            // check if we have a registered model for this dao
            if (hapiMongoModels[key]) {
                server.log(['debug'], '< db.internals._afterHapiMongoModels > Model exists for Dao `' + key + '`');

                Object.assign(internals._dao[key], { model: hapiMongoModels[key] });

                server.log(['debug'], '< db.internals._afterHapiMongoModels > Store model `' + key + '` in Dao');
            }
            else {
                server.log(['debug'], '< db.internals._afterHapiMongoModels > Model doesn\'t exist for Dao `' + key + '`');
            }
        });

        // expose dao
        internals._exposeDao(server);
    }

    server.log(['debug'], 'END < db.internals._afterHapiMongoModels >');

    next();
};

/**
 * Export class
 *
 * @type {Db}
 */
module.exports = Db;
