var eventStream = require('event-stream');


module.exports = function (gulp, plugins) {
  var browserSync = require('../../classes/browser-sync');
  var getDir = require("../../functions/get-dir");
  var notifier = require('node-notifier');
  var con = require('../../functions/console');
  var handleError = require('../../functions/handle-error');
  var directories = require('../../config/directories-config');

  return function () {
    con.hint('Processing css ...');

    var sassStream = gulp.src(getDir.src(directories.css + "/application.scss")) //add application.scss (where all the other scss files are included) to the event stream
      .pipe(plugins.plumber({errorHandler: handleError})) // prevents breaking the watcher on an error, just print it out in the console
      .pipe(plugins.cssGlobbing({ //replace global imports (@import some-folder/*) with multiple import lines that node-sass can understand
        extensions: ['.css', '.scss']
      }))
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.sass({
        includePaths: [global.prefix + directories.bower + "/"],
        errLogToConsole: true
      })); //compile sass files into css (include paths is an array of directories where node-sass can look for files when @import-ing them)

    var cssStream = gulp.src(getDir.files("css", "css"));

    /* Merge sass/css streams before proceeding with task */
    return eventStream.merge(cssStream, sassStream)
      .pipe(plugins.concat('app.css'))// concatenate everything into app.css file
      .pipe(plugins.autoprefixer({browsers: ['last 2 version']})) // autoprefix the needed css properties so the css is supported on the last 2 versions of every browser
      .pipe(plugins.if(!global.isProduction, plugins.cssbeautify())) //if not in production mode beautify the code so we can easily read the source
      .pipe(plugins.combineMediaQueries({log: false}))
      .pipe(plugins.if(global.isProduction, plugins.minifyCss({keepSpecialComments: '*'}))) // if in production mode minify/uglify the css
      .pipe(plugins.if(global.isProduction, plugins.rev()))
      .pipe(gulp.dest(getDir.build(directories.css))) // place the app.css files into the build/css folder of the project
      .pipe(plugins.if(global.isProduction, plugins.rev.manifest()))
      .pipe(plugins.if(global.isProduction, gulp.dest(getDir.build('rev/appcss'))))
      .pipe(browserSync.server.stream());
  }
};