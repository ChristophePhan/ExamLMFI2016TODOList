'use strict';

// Import libraries
const Boom      = require('boom');
const internals = {}; // Declare internals >> see: http://hapijs.com/styleguide

/**
* Controller Class definition
*/
class Controller {

    constructor(lib) {

        // Store data in private global property
        Object.assign(internals, { _lib: lib });

    }

    /**
    * Function to do controller process
    * @returns {*}
    */
    handler(request, reply) {

        // Get route parameters
        const params = request.params;

        request.log(['debug'], 'START < Todos.Controller.handler.delete > Params => ' + JSON.stringify(params));

        // Call lib to read one todo
        internals._lib.delete(params, (err, response) => {

            if (err) {

                request.log(['info'], '< Todos.Controller.handler.delete > An error occurred :');
                request.log(['error'], err);
                request.log(['debug'], 'END < Todos.Controller.handler.delete > with error');

                return reply(Boom.wrap(err));

            }

            request.log(['info'], '< Todos.Controller.handler.delete > Todo successfully deleted');
            reply(response).code(204);
            request.log(['debug'], 'END < Todos.Controller.handler.delete >');

        });

    } // handler(request, reply)

} // class Controller

/**
* Export class
* @type {Controller}
*/
module.exports = Controller;
