"use strict";

var gulp = require("gulp");
var typescript = require("gulp-typescript");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var merge = require("gulp-merge");
var template = require("gulp-template");
var through = require("through2");
var uglify = require("gulp-uglify");
var karma = require("karma").server;
var watchify = require("watchify");

var tsProject = typescript.createProject({
  typescript: require("typescript"),
  target: "ES5", sortOutput: true, module: "commonjs",
  noImplicitAny: true,
  noEmitOnError: true
});

function typescript_build(src, option) {
  return function() {
    return gulp.src(src, option)
      .pipe(sourcemaps.init())
      .pipe(typescript(tsProject))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest("./target/compiled/"));
  };
}

gulp.task("build:typescript",
          typescript_build(["./src/**/*.ts", "./typings/**/*.d.ts"],
                           {base: './'}));
gulp.task("test:typescript",
          typescript_build(["./test/**/*.ts", "./src/**/*.ts", "./typings/**/*.d.ts"],
                           {base: './'}));


gulp.task("build:bundle", ["build:typescript"], function() {
  return browserify("./target/compiled/src/index.js")
    .bundle()
    .pipe(source("index.js"))
    .pipe(gulp.dest("./target/bundle/src/"));
});


function test_bundle(isWatch) {
  function bundle(src, bundler) {
    return function() {
      return bundler
        .bundle()
        .pipe(source(src.replace(/.*\/target\/compiled\//, '')))
        .pipe(gulp.dest('./target/bundle/'));
    };
  }

  function browserified() {
    return through.obj(function(chunk, enc, callback) {
      if (chunk.isBuffer()) {
        var option = {debug: true};
        if (isWatch) {
          option.cache = {};
          option.packageCache = {};
        }
        var bundler = browserify(chunk.path, option);
        bundler.transform('espowerify');

        if (isWatch) {
          bundler = watchify(bundler);
          bundler.on('update', bundle(chunk.path, bundler));
        }

        chunk.contents = bundler.bundle();
        this.push(chunk);
      }
      callback();
    });
  }

  return function() {
    return gulp.src("./target/compiled/test/**/*.js",
                    {base: './target/compiled/'})
      .pipe(browserified())
      .pipe(gulp.dest("./target/bundle/"));
  };
}

gulp.task("test:bundle", ["test:typescript"], test_bundle(false));
gulp.task("watch:bundle", ["test:typescript"], test_bundle(true));


function userscript_meta(baseName) {
  return function () {
    var baseUrl = "https://raw.githubusercontent.com/gifnksm/nicovideo-thumbinfo-popup/master/";
    return gulp.src("./etc/userscript/header.txt")
      .pipe(template({
        pkg: require("./package.json"),
        updateUrl: baseUrl + baseName + ".meta.js",
        downloadUrl: baseUrl + baseName + ".user.js"
      }))
      .pipe(concat(baseName + ".meta.js"))
      .pipe(gulp.dest("./target/"));
  };
}

var userscript_normal_baseName = "nicovideothumbinfopopup";
var userscript_min_baseName = "nicovideothumbinfopopup.min";

gulp.task("build:meta:normal", userscript_meta(userscript_normal_baseName));
gulp.task("build:meta:min", userscript_meta(userscript_min_baseName));

function userscript_body(baseName, body) {
  return function() {
    return merge(
      gulp.src("./target/" + baseName + ".meta.js"),
      body()
    )
      .pipe(concat(baseName + ".user.js"))
      .pipe(gulp.dest("./target/"));
  };
}

gulp.task("build:normal", ["build:meta:normal", "build:bundle"],
          userscript_body(userscript_normal_baseName, function() {
            return gulp.src("./target/bundle/src/index.js");
          }));
gulp.task("build:min", ["build:meta:min", "build:bundle"],
          userscript_body(userscript_min_baseName, function() {
            return gulp.src("./target/bundle/src/index.js")
              .pipe(uglify());
          }));



gulp.task("build", ["build:normal", "build:min"]);

gulp.task("test", ["test:bundle"], function(done) {
  karma.start({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true,
    autoWatch: false
  }, function(exitStatus) {
    done(exitStatus ? "There are failing unit tests" : undefined);
  });
});

gulp.task("watch", ["watch:bundle"], function() {
  karma.start({
    configFile: __dirname + "/karma.conf.js",
    singleRun: false,
    autoWatch: true
  });

  return gulp.watch(["test/**/*.ts", "src/**/*.ts", "typings/**/*.d.ts"],
                    ["test:typescript"]);
});

gulp.task("clean", function(done) {
  var del = require("del");
  del(["./target/"], done);
});

gulp.task("default", ["build"]);
gulp.task("start", ["watch"]);

