module.exports = function (gulp, plugins, config) {

  var dir = require('../../functions/dir')(config);
  var bdir = require('../../functions/build-dir')(config);
  var fileDir = require('../../functions/file-dir')(config);
  var con = require('../../functions/console');
  var handleError = require('../../functions/handle-error');
  var streamqueue = require('streamqueue');

  return function () {
    con.hint("Processing javascript ... ");

    /* Process coffeescript to javascript */
    var coffeeScriptStream = gulp.src(fileDir("coffee", "js")) //find all the .coffee files in the project /js folder
      .pipe(plugins.plumber({errorHandler: handleError})) // prevents breaking the watcher on an error, just print it out in the console
      .pipe(plugins.coffee({ // compile coffeescript to javascript files
        bare: false
      }));

    /* Save stream of js files */
    var jsStream = gulp.src(fileDir('js', 'js')); // add .js file to current event stream

    /* Merge both js/coffeescript streams before continuing the task */
    return streamqueue({objectMode:true}, coffeeScriptStream, jsStream)
      .pipe(plugins.concat('app.js')) //concatenate them into an app.js file
      .pipe(plugins.babel()) // transpile es6 code to es5
      .pipe(plugins.ngAnnotate()) // annotate them in case we're using angular
      .pipe(plugins.batchReplace(config.replacements))// find and replace strings from config.replacements and from project config file
      .pipe(plugins.if(global.isProduction, plugins.uglify())) // if in production mode uglify/minify app.js
      .pipe(gulp.dest(bdir(config.dirs.js))) //place the app.js file into the build folder of the project
      .pipe(plugins.connect.reload()); // refresh the browser
  }
};