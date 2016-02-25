'use strict';

// import libraries
const Dao        = require('../class/dao');
const internals  = {};

/* Private properties */
internals._instance = null;

/**
 * Define {TodosDao} class
 */
class TodosDao extends Dao {

    constructor() {

        // call super constructor
        super('Todos');
    }

    /**
     * Returns singleton instance
     *
     * @returns {null|TodosDao|*}
     */
    static getInstance() {

        // singleton
        if (!(internals._instance instanceof TodosDao)) {
            internals._instance = new TodosDao();
        }

        return internals._instance;
    }
}

/**
 * Expose {TodosDao} class
 *
 * @type {TodosDao}
 */
module.exports = TodosDao;
