'use strict';

// import libraries
const CfgManager = require('node-config-manager');
const Async      = require('async');
const Boom       = require('boom');
const internals  = {};

/* Private properties */
internals._daoCfg = CfgManager.method.Dao();

/**
 * Define {Dao} abstract class
 */
class Dao {

    constructor(name) {

        // check instance of
        if (this.constructor === Dao) {
            throw new TypeError('Cannot construct Dao instances directly');
        }

        // check if name is set
        if (!name) {
            throw new ReferenceError('Missing Dao name');
        }

        // set dao name for log in super class
        this._name = name;
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
     * Sets private _model property value
     *
     * @param value
     */
    set model(value) {

        this._model = value;
    }

    /**
     * Returns private _model property value
     *
     * @returns {*}
     */
    get model() {

        return this._model;
    }

    /**
     * Returns private _name property value
     *
     * @returns {string}
     */
    get name() {

        return this._name;
    }

    /**
     * Function to create new category
     *
     * @param payload - Category data
     * @param callback - callback function
     */
    create(payload, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.create >');

        Async.waterfall(
            [
                (cb) => {

                    // validate payload
                    this.model.validate(payload, (err) => {

                        if (err) {
                            return cb(Boom.preconditionFailed(err.message));
                        }

                        cb();
                    });
                },
                (cb) => {

                    this.model.insertOne(payload, (err, categories) => {

                        if (err) {
                            if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                                cb(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                            }
                            else {
                                cb(Boom.wrap(err));
                            }
                        }
                        else {
                            cb(null, categories);
                        }
                    });
                }
            ],
            (err, categories) => {

                if (err) {
                    this.server.log(['debug'], 'END < ' + this.name + '.Dao.create > with error');

                    return callback(err);
                }

                this.server.log(['debug'], '< ' + this.name + '.Dao.create > ' + this.name + ' => ' + JSON.stringify(categories[0]));

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.create >');

                callback(null, categories[0]);
            }
        );
    }

    /**
     * Function to find a model by _id
     *
     * @param _id - primary key
     * @param callback - callback function
     */
    read(_id, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.read >');

        this.model.findOne({ _id: this.model.ObjectId(_id) }, (err, obj) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.read > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                if (obj) {
                    this.server.log(['info'], '< ' + this.name + '.Dao.read > ' + this.name + ' found for `_id` => ' + _id);

                    this.server.log(['debug'], '< ' + this.name + '.Dao.read > ' + this.name + ' => ' + JSON.stringify(obj));
                }
                else {
                    this.server.log(['info'], '< ' + this.name + '.Dao.read > No ' + this.name + ' found for `_id` => ' + _id);
                }

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.read >');

                callback(null, obj);
            }
        });
    }

    /**
     * Function to find a model with filter
     *
     * @param filter - mongo read filter
     * @param callback - callback function
     */
    readWithFilter(filter, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.readWithFilter >');

        this.model.findOne(filter, (err, obj) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.readWithFilter > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                if (obj) {
                    this.server.log(['info'], '< ' + this.name + '.Dao.readWithFilter > ' + this.name + ' found for `filter` => ' + JSON.stringify(filter));

                    this.server.log(['debug'], '< ' + this.name + '.Dao.readWithFilter > ' + this.name + ' => ' + JSON.stringify(obj));
                }
                else {
                    this.server.log(['info'], '< ' + this.name + '.Dao.readWithFilter > No ' + this.name + ' found for `filter` => ' + JSON.stringify(filter));
                }

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.readWithFilter >');

                callback(null, obj);
            }
        });
    }

    /**
     * Function to find all documents of a model
     *
     * @param callback - callback function
     */
    readAll(callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.readAll >');

        this.model.find({}, (err, objs) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.readAll > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                if (objs) {
                    this.server.log(['info'], '< ' + this.name + '.Dao.readAll > All ' + this.name + ' found');

                    this.server.log(['debug'], '< ' + this.name + '.Dao.readAll > ' + this.name + ' => ' + JSON.stringify(objs));
                }
                else {
                    this.server.log(['info'], '< ' + this.name + '.Dao.readAll > No ' + this.name + ' found');
                }

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.readAll >');

                callback(null, objs);
            }
        });
    }

    /**
     * Function to find all documents of a model with filter
     *
     * @param filter - mongo read filter
     * @param callback - callback function
     */
    readAllWithFilter(filter, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.readAllWithFilter >');

        this.model.find(filter, (err, objs) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.readAllWithFilter > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                if (objs) {
                    this.server.log(['info'], '< ' + this.name + '.Dao.readAllWithFilter > All ' + this.name +
                        ' found for `filter` => ' + JSON.stringify(filter));

                    this.server.log(['debug'], '< ' + this.name + '.Dao.readAllWithFilter > ' + this.name + ' => ' + JSON.stringify(objs));
                }
                else {
                    this.server.log(['info'], '< ' + this.name + '.Dao.readAllWithFilter > No ' + this.name +
                        ' found for `filter` => ' + JSON.stringify(filter));
                }

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.readAllWithFilter >');

                callback(null, objs);
            }
        });
    }

    /**
     * Function to update a model with primary key
     *
     * @param _id - primary key
     * @param operator - mongo update operator
     * @param callback - callback function
     */
    update(_id, operator, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.update >');

        this.model.updateOne({ _id: this.model.ObjectId(_id) }, operator, (err, count) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.update > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                this.server.log(['debug'], '< ' + this.name + '.Dao.update > ' + this.name + ' updated => ' + count);

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.update >');

                callback(null, count);
            }
        });
    }

    /**
     * Function to update a model with filter
     *
     * @param filter - mongo update filter
     * @param operator - mongo update operator
     * @param callback - callback function
     */
    updateWithFilter(filter, operator, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.updateWithFilter >');

        this.model.updateOne(filter, operator, (err, count) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.updateWithFilter > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                this.server.log(['debug'], '< ' + this.name + '.Dao.updateWithFilter > ' + this.name + ' updated => ' + count);

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.updateWithFilter >');

                callback(null, count);
            }
        });
    }

    /**
     * Function to read and update a model
     *
     * @param _id - Primary key
     * @param update - update payload
     * @param callback - callback function
     */
    readAndUpdate(_id, update, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.readAndUpdate >');

        this.model.findByIdAndUpdate(_id, update, (err, obj) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.readAndUpdate > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                if (obj) {
                    this.server.log(['info'], '< ' + this.name + '.Dao.readAndUpdate > ' + this.name + ' updated for `_id` => ' + _id);

                    this.server.log(['debug'], '< ' + this.name + '.Dao.readAndUpdate > ' + this.name + ' => ' + JSON.stringify(obj));
                }
                else {
                    this.server.log(['info'], '< ' + this.name + '.Dao.readAndUpdate > No ' + this.name + ' updated for `_id` => ' + _id);
                }

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.readAndUpdate >');

                callback(null, obj);
            }
        });
    }

    /**
     * Function to delete a model with filter
     *
     * @param _id - primary key
     * @param callback - callback function
     */
    delete(_id, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.delete >');

        this.model.deleteOne({ _id: this.model.ObjectId(_id) }, (err, count) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.delete > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                this.server.log(['debug'], '< ' + this.name + '.Dao.delete > ' + this.name + ' deleted => ' + count);

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.delete >');

                callback(null, count);
            }
        });
    }

    /**
     * Function to delete a model with filter
     *
     * @param filter - mongo update filter
     * @param callback - callback function
     */
    deleteWithFilter(filter, callback) {

        this.server.log(['debug'], 'START < ' + this.name + '.Dao.deleteWithFilter >');

        this.model.deleteOne(filter, (err, count) => {

            if (err) {
                this.server.log(['debug'], 'END < ' + this.name + '.Dao.deleteWithFilter > with error');

                if (err.code && internals._daoCfg.errorCodeMongoToHTTP[err.code]) {
                    callback(Boom.create(internals._daoCfg.errorCodeMongoToHTTP[err.code], err.message));
                }
                else {
                    callback(Boom.wrap(err));
                }
            }
            else {
                this.server.log(['debug'], '< ' + this.name + '.Dao.deleteWithFilter > ' + this.name + ' deleted => ' + count);

                this.server.log(['debug'], 'END < ' + this.name + '.Dao.deleteWithFilter >');

                callback(null, count);
            }
        });
    }
}

/**
 * Expose {Dao} class
 *
 * @type {Dao}
 */
module.exports = Dao;
