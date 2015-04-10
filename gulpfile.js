"use strict";

var gulp = require("gulp");
var typescript = require("gulp-typescript");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var sourcemaps = require("gulp-sourcemaps");
var tsd = require("gulp-tsd");
var espower = require("gulp-espower");
var karma = require("gulp-karma");
var concat = require("gulp-concat");
var merge = require("gulp-merge");
var buffer = require("gulp-buffer");
var template = require("gulp-template");
var bower = require("gulp-bower");
var through = require("through2");

var tsProject = typescript.createProject({
  typescript: require("typescript"),
  target: "ES5", sortOutput: true, module: "commonjs",
  noImplicitAny: true,
  noEmitOnError: true
});

gulp.task("prepare:tsd", function(cb) {
  return tsd({
    command: "reinstall",
    config: "./tsd.json"
  }, cb);
});

gulp.task("prepare:bower", function() {
  return bower();
});

gulp.task("build:typescript", ["prepare:tsd"], function() {
  return gulp.src(["./src/**/*.ts"])
    .pipe(sourcemaps.init())
    .pipe(typescript(tsProject))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./target/compiled/src/"));
});

gulp.task("build:concat", ["build:typescript"], function() {
  return merge(
    gulp.src("etc/userscript/header.txt")
      .pipe(template({ pkg: require("./package.json") })),
    browserify("./target/compiled/src/main.js")
      .bundle()
      .pipe(source("main.js"))
      .pipe(buffer())
  )
    .pipe(concat("nicovideo-thumbinfo-popup.user.js"))
    .pipe(gulp.dest("./target/"));
});

gulp.task("test:typescript", ["build:typescript"], function() {
  return gulp.src(["./test/**/*.ts"])
    .pipe(sourcemaps.init())
    .pipe(typescript(tsProject))
    .pipe(sourcemaps.write())
    .pipe(espower())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./target/compiled/test/"));
});

gulp.task("test:concat", ["test:typescript"], function() {
  var browserified = function() {
    return through.obj(function(chunk, enc, callback) {
      if (chunk.isBuffer()) {
        var b = browserify({
          entries: [chunk.path],
          debug: true
        });
        chunk.contents = b.bundle();
        this.push(chunk);
      }
      callback();
    });
  };

  return gulp.src(["./target/compiled/test/**/*.js"])
    .pipe(browserified())
    .pipe(gulp.dest("./target/test/"));
});

gulp.task("test:karma", ["test:concat", "prepare:bower"], function() {
  return gulp.src("./idontexist") // https://github.com/lazd/gulp-karma/issues/9
    .pipe(karma({
      configFile: "karma.conf.js",
      action: "run"
    }));
});

gulp.task("watch:karma", ["test:concat", "prepare:bower"], function() {
  gulp.src("./idontexist") // https://github.com/lazd/gulp-karma/issues/9
    .pipe(karma({
      configFile: "karma.conf.js",
      action: "watch"
    }));
});

gulp.task("prepare", ["prepare:tsd"]);
gulp.task("build", ["build:concat"]);
gulp.task("test", ["test:karma"]);
gulp.task("clean", function(cb) {
  var del = require("del");
  del(["./target"], cb);
});

gulp.task("default", ["build"]);
gulp.task("watch:build", ["build"], function() {
  gulp.watch("src/**/*.ts", ["build:concat"]);
});
gulp.task("watch:test", ["watch:karma"], function() {
  gulp.watch("src/**/*.ts", ["test:concat"]);
  gulp.watch("test/**/*.ts", ["test:concat"]);
});
gulp.task("watch", ["watch:build", "watch:test"]);
