"use strict";

var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var concat = require("gulp-concat");
var merge = require("gulp-merge");
var template = require("gulp-template");
var through = require("through2");
var uglify = require("gulp-uglify");
var karma = require("karma").server;
var watchify = require("watchify");
var rename = require("gulp-rename");
var buffer = require("gulp-buffer");
var istanbul = require("browserify-istanbul");
var coveralls = require("gulp-coveralls");
var del = require("del");

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
  bundle: pathConverter("./target/bundle/"),
  dist: pathConverter("./target/dist/")
};

gulp.task("build:bundle", function() {
  return browserify(Path.input("src/index.ts"))
    .plugin("tsify", { target: "ES5", noImplicitAny: true })
    .bundle()
    .pipe(source("index.js"))
    .pipe(gulp.dest(Path.bundle("src")))
    .pipe(rename({extname: ".min.js"}))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(Path.bundle("src")));
});


function test_bundle(isWatch) {
  function bundle(chunk, bundler) {
    return function() {
      return bundler
        .bundle()
        .pipe(source(chunk.relative))
        .pipe(rename({extname: ".js"}))
        .pipe(gulp.dest(Path.bundle()));
    };
  }

  function transform(fun) {
    return through.obj(function(chunk, end, cb) {
      if (chunk.isBuffer()) {
        chunk.contents = fun(chunk);
        this.push(chunk);
      }
      cb();
    });
  }

  function browserified() {
    return transform(function(chunk) {
      var option = {debug: true};
      if (isWatch) {
        option.cache = {};
        option.packageCache = {};
      }

      var bundler = browserify(chunk.path, option)
            .plugin("tsify", { target: "ES5", noImplicitAny: true })
            .transform('espowerify')
            .transform(istanbul({ defaultIgnore: false }));

      if (isWatch) {
        bundler = watchify(bundler);
        bundler.on('update', bundle(chunk, bundler));
      }
      return bundler.bundle();
    });
  }

  return function() {
    return gulp.src(Path.input("test/**/*.ts"), {base: Path.input()})
      .pipe(browserified())
      .pipe(rename({extname: ".js"}))
      .pipe(gulp.dest(Path.bundle()));
  };
}

gulp.task("test:bundle", test_bundle(false));
gulp.task("watch:bundle", test_bundle(true));


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
});

gulp.task("clean", function(done) {
  del(["./target/"], done);
});

gulp.task("coveralls", function() {
  return gulp.src("./target/coverage/**/lcov.info")
    .pipe(coveralls());
});

gulp.task("default", ["build"]);
gulp.task("start", ["watch"]);

