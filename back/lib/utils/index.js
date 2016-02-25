'use strict';

// import libraries
const Utils     = require('./class');
const UtilsLib  = require('./lib');
const internals = {}; // Declare internals >> see: http://hapijs.com/styleguide

// definition of plugin
internals.definition = {
    register: (server, options, next) => {

        return new Utils(UtilsLib.getInstance(), server, options, next);
    }
};

// register attributes
internals.definition.register.attributes = {
    pkg: require('./package')
};

// export plugin
module.exports = internals.definition;
