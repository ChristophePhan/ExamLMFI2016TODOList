'use strict';

module.exports = {
    opsInterval: 1000,
    reporters: [{
        reporter: require('good-console'),
        events: {
            log: '*',
            response: '*',
            request: '*',
            error: '*'
        },
        config: {
            format: 'DD-MM-YYYY HH:mm:ss.SSS'
        }
    }]
};
