module.exports = function (gulp, plugins, config) {

  var dir = require('../../functions/dir')(config);
  var bdir = require('../../functions/build-dir')(config);
  var fileDir = require('../../functions/file-dir')(config);
  var con = require('../../functions/console');
  var handleError = require('../../functions/handle-error');
  var eventStream = require('event-stream');

  var minifyHtmlOptions = {
    comments: false,
    quotes: true,
    spare: true,
    empty: true,
    cdata: true,
    loose: true
  };

  return function () {
    con.hint('Processing html ...');

    var filters = {
      excludePartials: plugins.filter(function (file) {
        return !/_/.test(file.path);
      }),
      includeJustCache: plugins.filter(function (file) {
        return /templates\.js/.test(file.path);
      })
    };

    var jadeStream = gulp.src(fileDir('jade', '')) // get .jade files from the root folder & templates folder
      .pipe(plugins.plumber({errorHandler: handleError})) // prevents breaking the watcher on an error, just print it out in the console
      .pipe(plugins.jade({ // compile jade files to html
        pretty: true
      }));

    var htmlStream = gulp.src(fileDir('html', ''));

    /* Merge jade/html streams before proceeding with the task */
    return eventStream.merge(jadeStream, htmlStream)
      .pipe(plugins.if(global.isProduction, plugins.minifyHtml(minifyHtmlOptions))) // if running task in production mode minify html
      .pipe(filters.excludePartials)
      .pipe(gulp.dest(bdir(config.dirs.root))) // place the processed .html files accordingly in the folders they belong to
      .pipe(plugins.angularTemplatecache({
        module: 'templates', standalone: true, base: function (file) {
          return file.relative
        }
      }))
      .pipe(filters.excludePartials.restore())
      .pipe(filters.includeJustCache)
      .pipe(plugins.if(global.isProduction, plugins.rev()))
      .pipe(gulp.dest(bdir(config.dirs.js)))
      .pipe(plugins.if(global.isProduction, plugins.rev.manifest()))
      .pipe(plugins.if(global.isProduction, gulp.dest(bdir('rev/templates'))));

  }
};