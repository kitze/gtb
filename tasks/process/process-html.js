module.exports = function (gulp, plugins, config) {

  var dir = require('../../functions/dir')(config);
  var bdir = require('../../functions/build-dir')(config);
  var fileDir = require('../../functions/file-dir')(config);
  var con = require('../../functions/console');
  var through = require('through');
  var handleError = require('../../functions/handle-error');

  var minifyHtmlOptions = {
    comments: false,
    quotes: true,
    spare: true,
    empty: true,
    cdata: true
  };

  return function () {
    con.hint('Processing html ...');
    gulp.src(fileDir('jade', '')) // get .jade files from the root folder & templates folder
      .pipe(plugins.plumber({errorHandler: handleError})) // prevents breaking the watcher on an error, just print it out in the console
      .pipe(plugins.jade({ // compile jade files to html
        pretty: true
      }))
      .pipe(plugins.addSrc(fileDir('html', ''))) // get .html files from root & templates folder
      .pipe(plugins.if(global.isProduction, plugins.minifyHtml(minifyHtmlOptions))) // if running task in production mode minify html
      .pipe(gulp.dest(bdir(config.dirs.root))) // place the processed .html files accordingly in the folders they belong to
      .pipe(plugins.connect.reload()); // refresh the browser
  }
};