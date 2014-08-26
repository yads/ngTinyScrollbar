'use strict';

var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    rm = require('rimraf'),
    es = require('event-stream');

gulp.task('clean', function()  {
    rm.sync('dist');
});

gulp.task('scripts', function() {

    return gulp.src('src/*.js')
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.uglify({
            preserveComments: 'some'
        }))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {

    var nonMin = gulp.src('src/*.less')
            .pipe(plugins.less())
            .pipe(plugins.autoprefixer('last 2 versions', 'ie > 8')),
        min = gulp.src('src/*.less')
            .pipe(plugins.less())
            .pipe(plugins.autoprefixer('last 2 versions', 'ie > 8'))
            .pipe(plugins.cssmin())
            .pipe(plugins.rename({suffix: '.min'}));
   return es.merge(nonMin, min)
       .pipe(gulp.dest('dist'));
});

gulp.task('build', ['scripts', 'styles'], function() {
    return gulp.src('src/*.js')
        .pipe(gulp.dest('dist'));
});

gulp.task('serve', function() {
	gulp.src('.')
		.pipe(plugins.webserver({
			livereload: true
		}));
});
