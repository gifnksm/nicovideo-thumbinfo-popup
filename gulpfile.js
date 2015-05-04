"use strict";

var browserify = require("browserify");
var del = require("del");
var glob = require("glob");
var gulp = require("gulp");
var buffer = require("gulp-buffer");
var concat = require("gulp-concat");
var coveralls = require("gulp-coveralls");
var extractor = require("gulp-extract-sourcemap");
var rename = require("gulp-rename");
var sourcemaps = require("gulp-sourcemaps");
var template = require("gulp-template");
var uglify = require("gulp-uglify");
var lcov_sourcemap = require("lcov-sourcemap");
var karma = require("karma").server;
var path = require("path");
var through = require("through2");
var watchify = require("watchify");
var source = require("vinyl-source-stream");

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

gulp.task("build:bundle:normal", function() {
  return browserify(Path.input("src/index.ts"), {debug: true, basedir: "."})
    .plugin("tsify", { target: "ES5", noImplicitAny: true })
    .bundle()
    .pipe(source("index.js"))
    .pipe(buffer())
    .pipe(extractor({
      basedir: Path.bundle("src"),
      removeSourcesContent: true
    }))
    .pipe(gulp.dest(Path.bundle("src")));
});

gulp.task("build:bundle:min", ["build:bundle:normal"], function() {
  return gulp.src(Path.bundle("src/index.js"))
    .pipe(rename({extname: ".min.js"}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(sourcemaps.write("./", {includeContent: false}))
    .pipe(gulp.dest(Path.bundle("src")));
});


function test_bundle(isWatch) {
  return function() {
    var files = glob.sync("test/**/*.ts").map(Path.input);

    var option = {debug: true, basedir: "." };
    if (isWatch) {
      option.cache = {};
      option.packageCache = {};
    }

    var bundler = browserify(files, option)
          .plugin("tsify", { target: "ES5", noImplicitAny: true })
          .transform('espowerify');

    if (isWatch) {
      bundler = watchify(bundler);
      bundler.on("update", bundle);
    }

    function bundle() {
      return bundler
        .bundle()
        .pipe(source("spec.js"))
        .pipe(buffer())
        .pipe(extractor({
          basedir: Path.bundle("test"),
          removeSourcesContent: true
        }))
        .pipe(gulp.dest(Path.bundle("test")));
    }

    return bundle();
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

  gulp.task("build:" + type, ["build:meta:" + type, "build:bundle:" + type], function() {
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

gulp.task("convert-lcov", function() {
  return gulp.src("./target/coverage/*/lcov.info", {base: "./"})
    .pipe(through.obj(function(chunk, end, cb) {
      var self = this;
      if (chunk.isBuffer()) {
        lcov_sourcemap(chunk.relative, { spec: Path.bundle("test/spec.js.map") }, Path.bundle("test"))
          .then(function(lcov) {
            lcov = lcov.replace(/^SF:(.*)/gm, function(line, dir) {
              return "SF:" + path.resolve("./target/coverage/converted/", dir);
            });
            var skipped = false;
            lcov = lcov.split("\n").filter(function(line) {
              if (/^SF:(.*)$/.test(line)) {
                skipped = (RegExp.$1.indexOf(path.resolve(".", "src")) !== 0) &&
                  (RegExp.$1.indexOf(path.resolve(".", "test")) !== 0);
              }
              return !skipped;
            }).join("\n");
            chunk.contents = new Buffer(lcov);
            self.push(chunk);
            cb();
          });
      } else {
        this.push(chunk);
        cb();
      }
    }))
    .pipe(rename("lcov_converted.info"))
    .pipe(gulp.dest("./target/coverage/converted/"));
});

gulp.task("coveralls", ["convert-lcov"], function() {
  return gulp.src("./target/coverage/converted/lcov_converted.info")
    .pipe(coveralls());
});

gulp.task("default", ["build"]);
gulp.task("start", ["watch"]);

