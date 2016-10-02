var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");
var WebpackDevServer = require("webpack-dev-server");
var nodemon = require("nodemon");

gulp.task("default", ["webpack-dev-server"]);

gulp.task("server", function() {
   nodemon({
      script: 'server.js',
      watch: ['server.js']
    }).on('restart', function() {
      gutil.log("Back-end server restarted.");
    });
  });

// Dev build
gulp.task("build-dev", ["webpack:build-dev", "server"], function() {
  gulp.watch(["public/**/*"], ["webpack:build-dev"]);
});

var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", function(callback) {
  devCompiler.run(function(err, stats) {
    if(err) throw new gutil.PluginError("webpack:build-dev", err);
    gutil.log("[webpack:build-dev]", stats.toString({
      colors: true
    }));
    callback();
  });
});

// Production build
gulp.task("build", ["webpack:build"]);

gulp.task("webpack:build", function(callback) {
  var myConfig = Object.create(webpackConfig);
  myConfig.plugins = (myConfig.plugins || []).concat(
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify("production")
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
    );

  // run webpack
  webpack(myConfig, function(err, stats) {
    if(err) throw new gutil.PluginError("webpack:build", err);
    gutil.log("[webpack:build]", stats.toString({
      colors: true
    }));
    callback();
  });
});

// Webpack Dev Server
gulp.task("webpack-dev-server", function(callback) {
  var myConfig = Object.create(webpackConfig);
  myConfig.devtool = "eval";
  myConfig.debug = true;

  new WebpackDevServer(webpack(myConfig), {
    contentBase: 'public/',
    publicPath: '/assets/',
    quiet: true
  }).listen(8080, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    // Server listening
    gutil.log("[webpack-dev-server]", "http://localhost:8080/");

    // nodemon({
    //   script: 'server.js',
    //   watch: ['server.js']
    // }).on('restart', function() {
    //   gutil.log("Back-end server restarted.");
    // });
    // keep the server alive or continue?
    // callback();
  });
});