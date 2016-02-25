'use strict';

// import libraries
const Gulp        = require('gulp');
const LoadPlugins = require('gulp-load-plugins');

// define internals variable
const internals   = {};

// set internals variables
internals.$ = LoadPlugins({
    pattern: ['gulp-*', 'uglify-save-license', 'del']
});

/********************
 * GULP BUILD TASKS *
 ********************/

Gulp.task('jshint', () => {

    Gulp.src(['./index.js', './application.js', './lib/**/*.js', './test/**/*.js', './config/**/*.js'])
        .pipe(internals.$.jshint())
        .pipe(internals.$.jshint.reporter('jshint-stylish'));
});

Gulp.task('test', ['jshint'], () => {

    return Gulp.src(['./test/**/*.js'])
        .pipe(internals.$.lab({
            args: '-v -L -C -c --coverage-exclude node_modules --coverage-exclude test --coverage-exclude config ' +
            '-r console -o stdout -r html -o coverage/index.html',
            opts: {
                emitLabError: true
            }
        }));
});

Gulp.task('server:extra:files', () => {

    const jsonFilter = internals.$.filter('**/*.json', { restore: true });

    Gulp.src(['package.json', 'License.md', 'README.md', 'lib/**/*.json', 'config/**/*.json'], { base: './' })
        .pipe(jsonFilter)
        .pipe(internals.$.jsonminify())
        .pipe(jsonFilter.restore)
        .pipe(Gulp.dest('dist/'))
        .pipe(internals.$.size({ title: 'dist/', showFiles: true }));
});

Gulp.task('server:js', ['server:lib:js'], () => {

    const jsFilter = internals.$.filter('**/*.js', { restore: true });

    Gulp.src(['config/**/*.js', 'index.js', 'application.js'], { base: './' })
        .pipe(jsFilter)
        .pipe(internals.$.babel({
            presets: ['es2015']
        }))
        .pipe(internals.$.uglify({ preserveComments: internals.$.uglifySaveLicense }))
        .pipe(Gulp.dest('dist/'))
        .pipe(internals.$.size({ title: 'dist/', showFiles: true }));
});

Gulp.task('server:lib:js', () => {

    const jsFilter = internals.$.filter('**/*.js', { restore: true });

    Gulp.src(['lib/**/*.js'], { base: './' })
        .pipe(jsFilter)
        .pipe(internals.$.babel({
            presets: ['es2015']
        }))
        .pipe(internals.$.uglify({ preserveComments: internals.$.uglifySaveLicense }))
        .pipe(Gulp.dest('dist/'))
        .pipe(internals.$.size({ title: 'dist/', showFiles: true }));
});

Gulp.task('server', ['jshint', 'server:extra:files', 'server:js']);

Gulp.task('clean', () => {

    internals.$.del.sync(['dist/']);
});

Gulp.task('build:api-application', ['clean', 'server']);
