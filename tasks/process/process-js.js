module.exports = function (gulp, plugins, config) {

  var browserSync = require('../../classes/browser-sync');
  var getDir = require('../../functions/get-dir');
  var con = require('../../functions/console');
  var handleError = require('../../functions/handle-error');
  var eventStream = require('event-stream');
  var directories = require('../../config/directories-config');
  var gulpConfig = require('../../functions/gulp-config').userConfig;

  return function () {
    con.hint("Processing javascript ...");

    /* In the replacements array you can add any key:value that later will be replaced in every of the html and js files
     * So for example if your app needs access to the port the app is running on and you have the port define in your gulpfile you can access
     * it easily from your html/js.
     */
    var replacements = [
      ['G_SERVER_PORT', gulpConfig.server.port]
    ];

    /* Process coffeescript to javascript */
    var coffeeScriptStream = gulp.src(getDir.files("coffee", "js")) //find all the .coffee files in the project /js folder
      .pipe(plugins.plumber({errorHandler: handleError})) // prevents breaking the watcher on an error, just print it out in the console
      .pipe(plugins.coffee({ // compile coffeescript to javascript files
        bare: false
      }));

    /* Save stream of js files */
    var jsStream = gulp.src(getDir.files('js', 'js')); // add .js file to current event stream

    /* Merge both js/coffeescript streams before continuing the task */
    var es = eventStream.merge(coffeeScriptStream, jsStream).on('end', function () {
      browserSync.server.reload();
    })
      .pipe(plugins.plumber({errorHandler: handleError})) // prevents breaking the watcher on an error, just print it out in the console
      .pipe(plugins.concat('app.js')) //concatenate them into an app.js file
      .pipe(plugins.babel()) // transpile es6 code to es5
      .pipe(plugins.ngAnnotate()) // annotate them in case we're using angular
      .pipe(plugins.batchReplace(replacements))// find and replace strings from config.replacements and from project config file
      .pipe(plugins.if(global.isProduction, plugins.uglify())) // if in production mode uglify/minify app.js
      .pipe(plugins.if(global.isProduction, plugins.rev()))
      .pipe(gulp.dest(getDir.build(directories.js))) //place the app.js file into the build folder of the project
      .pipe(plugins.if(global.isProduction, plugins.rev.manifest()))
      .pipe(plugins.if(global.isProduction, gulp.dest(getDir.build('rev/appjs'))))

    return es;
  }
};