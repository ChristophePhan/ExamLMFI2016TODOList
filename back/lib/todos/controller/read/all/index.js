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

        request.log(['debug'], 'START < Todos.Controller.handler.read.all >');

        // call lib to read all todos
        internals._lib.readAll((err, response) => {

            if (err) {
                request.log(['info'], '< Todos.Controller.handler.read.all > An error occurred :');
                request.log(['error'], err);
                request.log(['debug'], 'END < Todos.Controller.handler.read.all > with error');

                return reply(Boom.wrap(err));
            }

            if (!response) {
                request.log(['info'], '< Todos.Controller.handler.read.all > No todos found');

                request.log(['debug'], 'END < Todos.Controller.handler.read.all >');

                return reply().code(204);
            }

            request.log(['info'], '< Todos.Controller.handler.read.all > All todos successfully retrieved');

            reply(response);

            request.log(['debug'], 'END < Todos.Controller.handler.read.all >');
        });
    }
}

/**
 * Export class
 *
 * @type {Controller}
 */
module.exports = Controller;
