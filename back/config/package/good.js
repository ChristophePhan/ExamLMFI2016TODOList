'use strict';

module.exports = {
    opsInterval: 1000,
    reporters: [{
        reporter: require('good-console'),
        events: {
            log: ['info', 'error'],
            response: ['info', 'error'],
            request: ['info', 'error'],
            error: '*'
        },
        config: {
            format: 'DD-MM-YYYY HH:mm:ss.SSS'
        }
    }]
};
