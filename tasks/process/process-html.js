module.exports = function (gulp, plugins, config) {

  var browserSync = require('../../classes/browser-sync');
  var getDir = require('../../functions/get-dir');
  var con = require('../../functions/console');
  var handleError = require('../../functions/handle-error');
  var eventStream = require('event-stream');
  var minifyHtmlOptions = require('../../config/html-minify-config');
  var directories = require('../../config/directories-config');
  var postHtmlBemConfig = require('../../config/posthtml-bem-config');
  var postHtmlBem = require('posthtml-bem');

  return function () {
    con.hint('Processing html ...');

    var postHtmlPlugins = [
      postHtmlBem(postHtmlBemConfig)
    ];

    var filters = {
      excludePartials: plugins.filter(function (file) {
        return !/_/.test(file.path);
      }),
      includeJustCache: plugins.filter(function (file) {
        return /templates\.js/.test(file.path);
      })
    };

    var jadeStream = gulp.src(getDir.files('jade', '')) // get .jade files from the root folder & templates folder
      .pipe(plugins.plumber({errorHandler: handleError})) // prevents breaking the watcher on an error, just print it out in the console
      .pipe(plugins.jade({ // compile jade files to html
        pretty: true
      }));

    var htmlStream = gulp.src(getDir.files('html', ''));

    /* Merge jade/html streams before proceeding with the task */
    var es = eventStream.merge(jadeStream, htmlStream)
      .on('end', function () {
        browserSync.server.reload();
      })
      .pipe(plugins.posthtml(postHtmlPlugins))
      .pipe(plugins.if(global.isProduction, plugins.minifyHtml(minifyHtmlOptions))) // if running task in production mode minify html
      .pipe(filters.excludePartials)
      .pipe(gulp.dest(getDir.build(directories.root))) // place the processed .html files accordingly in the folders they belong to
      .pipe(plugins.angularTemplatecache({
        module: 'templates', standalone: true, base: function (file) {
          return file.relative
        }
      }))
      .pipe(filters.excludePartials.restore())
      .pipe(filters.includeJustCache)
      .pipe(plugins.if(global.isProduction, plugins.rev()))
      .pipe(gulp.dest(getDir.build(directories.js)))
      .pipe(plugins.if(global.isProduction, plugins.rev.manifest()))
      .pipe(plugins.if(global.isProduction, gulp.dest(getDir.build('rev/templates'))));

    return es;

  }
};