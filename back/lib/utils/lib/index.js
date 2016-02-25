'use strict';

// import libraries
const CfgManager = require('node-config-manager');
const Async      = require('async');
const Boom       = require('boom');
const Joi        = require('joi');
const internals  = {};

/**
 * Properties to store config files
 */
internals._routeCfg = CfgManager.method.Route();

/* Private properties */
internals._instance = null;

/**
 * Define {UtilsLib} class
 */
class UtilsLib {

    constructor() {

        this._schema = require('../schema');
    }

    /**
     * Sets private _server property value
     *
     * @param value
     */
    set server(value) {

        this._server = value;
    }

    /**
     * Returns private _server property value
     *
     * @returns {*}
     */
    get server() {

        return this._server;
    }

    /**
     * Returns private _schema property value
     *
     * @returns {*|exports|module.exports}
     */
    get schema() {

        return this._schema;
    }

    /**
     * Function to build API url
     *
     * @param endPoint - identifier of the end point path in config
     * @param params - query string parameters
     * @param pathParams - path parameters
     * @param callback - callback function
     */
    getUrl(endPoint, params, pathParams, callback) {

        this.server.log(['debug'], 'START < UtilsLib.getUrl >');

        Async.waterfall(
            [
                (cb) => {

                    Joi.validate(endPoint, this.schema.endPoint, (err) => {

                        if (err) {
                            return cb(Boom.preconditionFailed(err.message));
                        }

                        cb();
                    });
                },
                (cb) => {

                    Joi.validate(params, this.schema.params, (err) => {

                        if (err) {
                            return cb(Boom.preconditionFailed(err.message));
                        }

                        cb();
                    });
                },
                (cb) => {

                    Joi.validate(pathParams, this.schema.pathParams, (err) => {

                        if (err) {
                            return cb(Boom.preconditionFailed(err.message));
                        }

                        cb();
                    });
                },
                (cb) => {

                    // initialize variable
                    let url = internals._routeCfg.protocol + '://' + internals._routeCfg.host;

                    // add port if required
                    if (internals._routeCfg.port) {
                        url += ':' + internals._routeCfg.port;
                    }

                    // add end of url
                    url += internals._routeCfg.apiPath + internals._routeCfg.apiVersion + internals._routeCfg.endPoints[endPoint];

                    // change path parameters if required
                    if (pathParams) {
                        pathParams.forEach((param) => url = url.replace(param.replace, param.value));
                    }

                    // add query parameters if required
                    if (params) {
                        const parameters = [];

                        Object.keys(params).forEach((key) => parameters.push(key + '=' + encodeURIComponent(params[key])));

                        // create query string
                        url += '?' + parameters.join('&');
                    }

                    cb(null, url);
                }
            ],
            (err, url) => {

                if (err) {
                    this.server.log(['debug'], 'END < UtilsLib.getUrl > with error');

                    return callback(err);
                }

                this.server.log(['debug'], 'END < UtilsLib.getUrl >');

                callback(null, url);
            }
        );
    }

    /**
     * Returns singleton instance
     *
     * @returns {null|UtilsLib|*}
     */
    static getInstance() {

        // singleton
        if (!(internals._instance instanceof UtilsLib)) {
            internals._instance = new UtilsLib();
        }

        return internals._instance;
    }
}

/**
 * Expose {UtilsLib} class
 *
 * @type {UtilsLib}
 */
module.exports = UtilsLib;
