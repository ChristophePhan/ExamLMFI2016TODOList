'use strict';

// import libraries
const Hoek       = require('hoek');
const Controller = require('../../controller/create');
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
        Hoek.assert(options.schema.createTodoRequest, 'schema must contain createTodoRequest value to have good schema'); // no schema
        Hoek.assert(options.schema.todoResponse, 'schema must contain todoResponse value to have good schema'); // no schema

        // store data in private global property
        Object.assign(internals, {
            _lib: lib,
            _method: 'POST',
            _path: options.endPoints.todos,
            _schema: {
                request: options.schema.createTodoRequest,
                response: options.schema.todoResponse
            },
            _controller: new Controller(lib)
        });
    }

    /**
     * Function to return new instance of HapiJS route object
     *
     * @returns {{method: string, path: string, handler: handler, config: {validate: {payload: *},
     *            response: {status: {201: *}}, payload: {output: string, allow: string, parse: boolean}}}}
     */
    definition() {

        return {
            method: internals._method,
            path: internals._path,
            handler: (request, reply) => {

                return internals._controller.handler(request, reply);
            },
            config: {
                validate:
                {
                    payload: internals._schema.request
                },
                response: {
                    status: {
                        201: internals._schema.response
                    }
                },
                payload:
                {
                    output: 'data',
                    allow: 'application/json',
                    parse: true
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
