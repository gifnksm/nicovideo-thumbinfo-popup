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
var rename = require("gulp-rename");
var buffer = require("gulp-buffer");

function pathConverter(base) {
  return function(path) {
    if (path === undefined) {
      return base;
    }
    return base + path;
  };
}

var Path = {
  input: pathConverter("./"),
  compiled: pathConverter("./target/compiled/"),
  bundle: pathConverter("./target/bundle/"),
  dist: pathConverter("./target/dist/")
};

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
      .pipe(gulp.dest(Path.compiled()));
  };
}

gulp.task("build:typescript",
          typescript_build(Path.input("src/**/*.ts"), {base: Path.input()}));
gulp.task("test:typescript", ["build:typescript"],
          typescript_build(Path.input("test/**/*.ts"), {base: Path.input()}));


gulp.task("build:bundle", ["build:typescript"], function() {
  return browserify(Path.compiled("src/index.js"))
    .bundle()
    .pipe(source("index.js"))
    .pipe(gulp.dest(Path.bundle("src")))
    .pipe(rename({extname: ".min.js"}))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(Path.bundle("src")));
});


function test_bundle(isWatch) {
  function bundle(src, bundler) {
    return function() {
      return bundler
        .bundle()
        .pipe(source(src.replace(/.*\/target\/compiled\//, '')))
        .pipe(gulp.dest(Path.bundle()));
    };
  }

  function transform(fun) {
    return through.obj(function(chunk, end, cb) {
      if (chunk.isBuffer()) {
        chunk.contents = fun(chunk.path);
        this.push(chunk);
      }
      cb();
    });
  }

  function browserified() {
    return transform(function(path) {
      var option = {debug: true};
      if (isWatch) {
        option.cache = {};
        option.packageCache = {};
      }

      var bundler = browserify(path, option);
      bundler.transform('espowerify');

      if (isWatch) {
        bundler = watchify(bundler);
        bundler.on('update', bundle(path, bundler));
      }
      return bundler.bundle();
    });
  }

  return function() {
    return gulp.src(Path.compiled("test/**/*.js"), {base: Path.compiled()})
      .pipe(browserified())
      .pipe(gulp.dest(Path.bundle()));
  };
}

gulp.task("test:bundle", ["test:typescript"], test_bundle(false));
gulp.task("watch:bundle", ["test:typescript"], test_bundle(true));


var userscriptBaseName = {
  normal: "nicovideothumbinfopopup",
  min: "nicovideothumbinfopopup.min"
};
var bundleSrcName = {
  normal: "index.js",
  min: "index.min.js"
};

["normal", "min"].forEach(function(type) {
  var baseName = userscriptBaseName[type];
  var src = bundleSrcName[type];

  gulp.task("build:meta:" + type, function () {
    var baseUrl = "https://raw.githubusercontent.com/gifnksm/nicovideo-thumbinfo-popup/master/";
    return gulp.src("./etc/userscript/header.txt")
      .pipe(template({
        pkg: require("./package.json"),
        updateUrl: baseUrl + baseName + ".meta.js",
        downloadUrl: baseUrl + baseName + ".user.js"
      }))
      .pipe(rename(baseName + ".meta.js"))
      .pipe(gulp.dest(Path.dist()));
  });

  gulp.task("build:" + type, ["build:meta:" + type, "build:bundle"], function() {
    gulp.src([Path.dist(baseName + ".meta.js"), Path.bundle("src/" + src)])
      .pipe(concat(baseName + ".user.js"))
      .pipe(gulp.dest(Path.dist()));
  });
});

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

  return gulp.watch([Path.input("test/**/*.ts"),
                     Path.input("src/**/*.ts"),
                     "typings/**/*.d.ts",
                     "!**/.#*"],
                    ["test:typescript"]);
});

gulp.task("clean", function(done) {
  var del = require("del");
  del(["./target/"], done);
});

gulp.task("default", ["build"]);
gulp.task("start", ["watch"]);

