'use strict';

// import libraries
const Boom      = require('boom');
const internals = {}; // Declare internals >> see: http://hapijs.com/styleguide

/**
 * Controller Class definition
 */
class Controller {

    constructor(lib) {
        // store data in private global property
        Object.assign(internals, { _lib: lib });
    }

    /**
     * Function to do controller process
     * @returns {*}
     */
    handler(request, reply) {

        // get payload
        const payload = request.payload;

        request.log(['debug'], 'START < Todos.Controller.handler.create > Params => ' + JSON.stringify(payload));

        // call lib to create new todo
        internals._lib.create(payload, (err, response) => {

            if (err) {
                request.log(['info'], '< Todos.Controller.handler.create > An error occurred :');
                request.log(['error'], err);
                request.log(['debug'], 'END < Todos.Controller.handler.create > with error');

                return reply(Boom.wrap(err));
            }

            request.log(['info'], '< Todos.Controller.handler.create > New todo successfully created');

            reply(response).code(201);

            request.log(['debug'], 'END < Todos.Controller.handler.create >');
        });
    }
}

/**
 * Export class
 *
 * @type {Controller}
 */
module.exports = Controller;
