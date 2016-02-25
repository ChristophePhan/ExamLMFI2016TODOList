'use strict';

// import libraries
const Hoek       = require('hoek');
const Controller = require('../../../controller/read/all');
const internals  = {}; // Declare internals >> see: http://hapijs.com/styleguide

/**
 * Route Class definition
 */
class Route {

    constructor(lib, options) {

        // check options
        Hoek.assert(options, 'options are required for token routes'); // pre-auth checks
        Hoek.assert(options.endPoints, 'options must contain endPoints function to have good schema'); // no schema
        Hoek.assert(options.endPoints.todos, 'endPoints must contain todos function to have good schema'); // no schema
        Hoek.assert(options.schema, 'options must contain schema function to have good schema'); // no schema
        Hoek.assert(options.schema.todosResponse, 'schema must contain todosResponse value to have good schema'); // no schema

        // store data in private global property
        Object.assign(internals, {
            _lib: lib,
            _method: 'GET',
            _path: options.endPoints.todos,
            _schema: {
                response: options.schema.todosResponse
            },
            _controller: new Controller(lib)
        });
    }

    /**
     * Function to return new instance of HapiJS route object
     *
     * @returns {{method: (string|string), path: *, handler: handler, config: {response: {status: {200: *}}}}}
     */
    definition() {

        return {
            method: internals._method,
            path: internals._path,
            handler: (request, reply) => {

                return internals._controller.handler(request, reply);
            },
            config: {
                response: {
                    status: {
                        200: internals._schema.response
                    }
                }
            }
        };
    }
}

/**
 * Export class
 *
 * @type {Route}
 */
module.exports = Route;
