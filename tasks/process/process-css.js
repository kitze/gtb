module.exports = function (gulp, plugins, config) {

  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);
  var fileDir = require("../../functions/file-dir")(config);
  var notifier = require('gulp-notify/node_modules/node-notifier');
  var con = require('../../functions/console');
  var chalk = require('chalk');
  var handleError = require('../../functions/handle-error');
  var streamqueue = require('streamqueue');

  return function () {
    con.hint('Processing css ...');

    var sassStream = gulp.src(dir(config.dirs.css + "/application.scss")) //add application.scss (where all the other scss files are included) to the event stream
      .pipe(plugins.plumber()) // prevents breaking the watcher on an error, just print it out in the console
      .pipe(plugins.cssGlobbing({ //replace global imports (@import some-folder/*) with multiple import lines that node-sass can understand
        extensions: ['.css', '.scss']
      }))
      .pipe(plugins.sass({onError: handleError, includePaths: [global.prefix + config.dirs.bower + "/"]})); //compile sass files into css (include paths is an array of directories where node-sass can look for files when @import-ing them)

    var cssStream = gulp.src(fileDir("css", "css"));

    /* Merge sass/css streams before proceeding with task */
    return streamqueue({objectMode: true}, sassStream, cssStream)
      .pipe(plugins.concat('app.css'))// concatenate everything into app.css file
      .pipe(plugins.autoprefixer({browsers: ['last 2 version']})) // autoprefix the needed css properties so the css is supported on the last 2 versions of every browser
      .pipe(plugins.if(!global.isProduction, plugins.cssbeautify())) //if not in production mode beautify the code so we can easily read the source
      .pipe(plugins.if(global.isProduction, plugins.minifyCss({keepSpecialComments: '*'}))) // if in production mode minify/uglify the css
      .pipe(plugins.if(global.isProduction, plugins.rev()))
      .pipe(gulp.dest(bdir(config.dirs.css))) // place the app.css files into the build/css folder of the project
      .pipe(plugins.if(global.isProduction, plugins.rev.manifest()))
      .pipe(plugins.if(global.isProduction, gulp.dest(bdir('rev/appcss'))))
      .pipe(plugins.connect.reload()); //reload the browser after changes
  }
};