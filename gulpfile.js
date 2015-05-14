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
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var template = require("gulp-template");
var uglify = require("gulp-uglify");
var gutil = require("gulp-util");
var lcovSourcemap = require("lcov-sourcemap");
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

function doBundle(pattern, outName, isDebug, isWatch) {
  return function() {
    var files = glob.sync(pattern).map(Path.input);
    var outDir = path.join(Path.bundle(), path.dirname(outName));
    outName = path.basename(outName);
    var outPath = path.join(outDir, outName);

    var option = {debug: true, basedir: "." };
    if (isWatch) {
      option.cache = {};
      option.packageCache = {};
    }

    var bundler = browserify(files, option)
          .plugin("tsify", { target: "ES5", noImplicitAny: true });

    if (isDebug) {
      bundler = bundler.transform('espowerify');
    }

    if (isWatch) {
      bundler = watchify(bundler);
      bundler.on("update", function(files) {
        gutil.log("Watchify update: '" + gutil.colors.cyan(outPath) + "':");
        files.forEach(function(file) { gutil.log("\t" + file); });
      });
      bundler.on("update", bundle);
      bundler.on("log", function(msg) {
        gutil.log("Watchify: '" + gutil.colors.cyan(outPath) + "': " + msg);
      });
    }

    function bundle() {
      var b = bundler.bundle();

      b = b.on("error", function(err) {
        gutil.log("[" + gutil.colors.yellow("Browserify") + "] '" +
                  gutil.colors.cyan(outPath) + "' " +
                  gutil.colors.red("error: ") + err.message);

        if (isWatch) {
          this.emit("end");
        } else {
          process.exit(1);
        }
      });

      return b.pipe(source(outName))
        .pipe(buffer())
        .pipe(extractor({
          basedir: outDir,
          removeSourcesContent: true
        }))
        .pipe(gulp.dest(outDir));
    }

    return bundle();
  };
}

function doBundleMin() {
  return function() {
    return gulp.src(Path.bundle("src/index.js"))
      .pipe(rename({extname: ".min.js"}))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(sourcemaps.write("./", {includeContent: false}))
      .pipe(gulp.dest(Path.bundle("src")));
  };
}

var userscriptBaseName = {
  normal: "nicovideothumbinfopopup",
  min: "nicovideothumbinfopopup.min"
};
var bundleSrcName = {
  normal: "index.js",
  min: "index.min.js"
};

function doBuildMeta(type) {
  var baseUrl = "https://raw.githubusercontent.com/gifnksm/nicovideo-thumbinfo-popup/master/";
  var baseName = userscriptBaseName[type];

  return function() {
    return gulp.src("./etc/userscript/header.txt")
      .pipe(template({
        pkg: require("./package.json"),
        baseUrl: baseUrl,
        updateUrl: baseUrl + baseName + ".meta.js",
        downloadUrl: baseUrl + baseName + ".user.js"
      }))
      .pipe(rename(baseName + ".meta.js"))
      .pipe(gulp.dest(Path.dist()));
  };
}

function doBuild(type) {
  var baseName = userscriptBaseName[type];
  var src = bundleSrcName[type];

  return function() {
    return gulp.src([Path.dist(baseName + ".meta.js"), Path.bundle("src/" + src)])
      .pipe(concat(baseName + ".user.js"))
      .pipe(gulp.dest(Path.dist()));
  };
}

function doBuildScss() {
  return function() {
    return gulp.src("./etc/styles/*.scss")
      .pipe(sass())
      .pipe(gulp.dest(Path.dist()));
  };
}

gulp.task("build:bundle:normal", doBundle("src/index.ts", "src/index.js", false, false));
gulp.task("build:bundle:min", ["build:bundle:normal"], doBundleMin());
gulp.task("build:scss", doBuildScss());
gulp.task("test:bundle", doBundle("test/**/*-spec.ts", "test/spec.js", true, false));

gulp.task("watch:build:bundle:normal", doBundle("src/index.ts", "src/index.js", false, true));
gulp.task("watch:test:bundle", doBundle("test/**/*-spec.ts", "test/spec.js", true, true));

["normal", "min"].forEach(function(type) {
  gulp.task("build:meta:" + type, doBuildMeta(type));
  gulp.task("build:" + type, ["build:meta:" + type, "build:bundle:" + type], doBuild(type));
  gulp.task("build:" + type + ":only", doBuild(type));
});
gulp.task("build", ["build:normal", "build:min", "build:scss"]);

gulp.task("test", ["test:bundle"], function(done) {
  karma.start({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true,
    autoWatch: false
  }, function(exitStatus) {
    done(exitStatus ? "There are failing unit tests" : undefined);
  });
});

gulp.task("watch:build", ["watch:build:bundle:normal"], function() {
  function changed(event) {
    gutil.log("File: '" + gutil.colors.cyan(event.path) + "' is " + event.type);
  }
  gulp.watch(Path.bundle("src/index.js"), doBundleMin())
    .on("change", changed);

  ["normal", "min"].forEach(function(type) {
    var baseName = userscriptBaseName[type];
    var src = bundleSrcName[type];

    gulp.watch("./etc/userscript/header.txt", ["build:meta:" + type])
      .on("change", changed);
    gulp.watch([Path.dist(baseName + ".meta.js"), Path.bundle("src/" + src)],
               ["build:" + type + ":only"])
      .on("change", changed);
  });

  gulp.watch("./etc/styles/*.scss", ["build:scss"])
    .on("change", changed);
});

gulp.task("watch:test", ["watch:test:bundle"], function() {
  karma.start({
    configFile: __dirname + "/karma.conf.js",
    singleRun: false,
    autoWatch: true
  });
});

gulp.task("watch", ["watch:build", "watch:test"]);

gulp.task("clean", function(done) {
  del(["./target/"], done);
});

function convertLcovAbsPath(lcov) {
  return lcov.replace(/^SF:(.*)/gm, function(line, dir) {
    return "SF:" + path.resolve("./target/coverage/converted/", dir);
  });
}

function filterLcovFile(lcov, cond) {
  var skipped = false;
  return lcov.split("\n").filter(function(line) {
    if (/^SF:(.*)$/.test(line)) {
      skipped = !cond(RegExp.$1);
    }
    return !skipped;
  }).join("\n");
}

gulp.task("convert-lcov", function() {
  return gulp.src("./target/coverage/*/lcov.info", {base: "./"})
    .pipe(through.obj(function(chunk, end, cb) {
      var self = this;
      if (chunk.isBuffer()) {
        lcovSourcemap(chunk.relative, { spec: Path.bundle("test/spec.js.map") }, Path.bundle("test"))
          .then(function(lcov) {
            chunk.contents = new Buffer(convertLcovAbsPath(lcov));
            self.push(chunk);
            cb();
          });
      } else {
        this.push(chunk);
        cb();
      }
    }))
    .pipe(rename("lcov_all.info"))
    .pipe(gulp.dest("./target/coverage/converted/"))
    .pipe(through.obj(function(chunk, end, cb) {
      if (chunk.isBuffer()) {
        chunk.contents = new Buffer(filterLcovFile(chunk.contents.toString(), function(file) {
          return file.indexOf(path.resolve(".", "src")) === 0 ||
            file.indexOf(path.resolve(".", "test")) === 0;
        }));
      }
      this.push(chunk);
      cb();
    }))
    .pipe(rename("lcov_mine.info"))
    .pipe(gulp.dest("./target/coverage/converted/"))
    .pipe(through.obj(function(chunk, end, cb) {
      if (chunk.isBuffer()) {
        chunk.contents = new Buffer(filterLcovFile(chunk.contents.toString(), function(file) {
          return file.indexOf(path.resolve(".", "src")) === 0;
        }));
      }
      this.push(chunk);
      cb();
    }))
    .pipe(rename("lcov_src.info"))
    .pipe(gulp.dest("./target/coverage/converted/"));
});

gulp.task("coveralls", ["convert-lcov"], function() {
  return gulp.src("./target/coverage/converted/lcov_src.info")
    .pipe(coveralls());
});

gulp.task("default", ["build"]);
gulp.task("start", ["watch"]);

