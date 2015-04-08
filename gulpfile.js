"use strict";

var gulp = require('gulp');
var typescript = require('gulp-typescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var tsd = require('gulp-tsd');
var espower = require('gulp-espower');
var karma = require('gulp-karma');

var tsProject = typescript.createProject({
  typescript: require('typescript'),
  target: "ES5", sortOutput: true, module: "commonjs",
  noImplicitAny: true
});

gulp.task('prepare:tsd', function(cb) {
  tsd({
    command: 'reinstall',
    config: './tsd.json'
  }, cb);
});

gulp.task('build:typescript', ['prepare:tsd'], function() {
  return gulp.src(["./src/**/*.ts"])
    .pipe(sourcemaps.init())
    .pipe(typescript(tsProject))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./target/src"));
});

gulp.task('build:browserify', ['build:typescript'], function() {
  return browserify('./target/src/main.js')
    .bundle()
    .pipe(source("nicovideo-thumbinfo-popup.user.js"))
    .pipe(gulp.dest("./target/"));
});

gulp.task('test:typescript', ['build:typescript'], function() {
  return gulp.src(["./test/**/*.ts"])
    .pipe(sourcemaps.init())
    .pipe(typescript(tsProject))
    .pipe(espower())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./target/test"));
});

gulp.task('test:karma', ['test:typescript'], function() {
  return gulp.src('target/test/**/*.js')
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('watch:karma', ['test:typescript'], function() {
  gulp.src('target/test/**/*.js')
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});

gulp.task('prepare', ['prepare:tsd']);
gulp.task('build', ['build:browserify']);
gulp.task('test', ['test:karma']);
gulp.task('clean', function(cb) {
  var del = require('del');
  del(['./target'], cb);
});

gulp.task('default', ['build']);
gulp.task('watch:build', ['build'], function() {
  gulp.watch('src/**/*.ts', ['build:browserify']);
});
gulp.task('watch:test', ['watch:karma'], function() {
  gulp.watch('src/**/*.ts', ['test:typescript']);
  gulp.watch('test/**/*.ts', ['test:typescript']);
});
gulp.task('watch', ['watch:build', 'watch:test']);
