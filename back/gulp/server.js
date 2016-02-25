'use strict';

// import libraries
const Gulp    = require('gulp');
const Nodemon = require('gulp-nodemon');

/*********************
 * GULP SERVER TASKS *
 *********************/

Gulp.task('serve:api-application', ['jshint'], () => {

    // configure nodemon
    return Nodemon({
        script: './index.js',
        ext: 'js json',
        tasks: ['jshint']
    });
});
