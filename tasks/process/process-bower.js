var _ = require('lodash');
var map = require('map-stream');
var path = require('path');
var notifier = require('node-notifier');
var eventStream = require('event-stream');
var q = require('q');

module.exports = function (gulp, plugins, config) {

  return function () {

    var directories = require('../../config/directories-config');
    var con = require('../../functions/console');
    var getDir = require('../../functions/get-dir');
    var getAllBowerFiles = require('../../functions/get-all-bower-files')(gulp, plugins, config);
    var getAdditionalFonts = require('../../functions/get-additional-fonts')(gulp, plugins, config);

    var jsFilter     = plugins.filter('**/*.js'),
        cssFilter    = plugins.filter(['*.css', '**/*.css']),
        assetsFilter = plugins.filter(['!**/*.js', '!**/*.css', '!**/*.scss']);

    var additionalFonts = [];

    function keepOriginal(url) {
      return _.some(additionalFonts, function (font) {
        return font.escapeUrl.test(url);
      });
    }

    //init

    var deferred = q.defer();
    con.hint('Processing bower ...');

    getAllBowerFiles().then(function (bowerFiles) {

      additionalFonts = getAdditionalFonts(bowerFiles);

      var fontsFromBower = _.map(additionalFonts, function (fontLibrary) {
        return global.prefix + directories.bower + "/" + fontLibrary.name + "/" + fontLibrary.directory + "/" + "*";
      });

      if (fontsFromBower.length > 0) {
        gulp.src(fontsFromBower)
          .pipe(gulp.dest(getDir.build(directories.fonts)));
      }

      // Get CSS files from bower directory
      var libCssStream = gulp.src(bowerFiles)
        .pipe(cssFilter)
        .pipe(map(function (file, callback) {
          var relativePath = path.dirname(path.relative(path.resolve(directories.js), file.path));
          var contents = file.contents.toString().replace(/url\([^)]*\)/g, function (match) {
            // find the url path, ignore quotes in url string
            var matches = /url\s*\(\s*(('([^']*)')|("([^"]*)")|([^'"]*))\s*\)/.exec(match),
                url     = matches[3] || matches[5] || matches[6];
            // Don't modify data, http(s) and protocol agnostic urls
            if (/^data:/.test(url) || /^http(:?s)?:/.test(url) || /^\/\//.test(url) || keepOriginal(url))
              return 'url(' + url + ')';
            return 'url(' + path.join(path.relative(directories.js, directories.app), directories.js, relativePath, url) + ')';
          });
          file.contents = new Buffer(contents);
          callback(null, file);
        }))
        .pipe(plugins.concat('lib.css'))
        .pipe(plugins.if(global.isProduction, plugins.rev()))
        .pipe(plugins.if(global.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
        .pipe(gulp.dest(getDir.build(directories.css)))
        .pipe(plugins.if(global.isProduction, plugins.rev.manifest()))
        .pipe(plugins.if(global.isProduction, gulp.dest(getDir.build('rev/libcss'))))
        .pipe(cssFilter.restore());

      var assetsStream = gulp.src(bowerFiles)
        .pipe(assetsFilter)
        .pipe(gulp.dest(getDir.build(directories.js)))
        .pipe(assetsFilter.restore());

      /* Get JS files from bower directory */
      var libJsStream = gulp.src(bowerFiles)
        .pipe(jsFilter)
        .pipe(plugins.concat('lib.js'))
        .pipe(plugins.ngAnnotate()) // annotate them in case we're using angular
        .pipe(plugins.if(global.isProduction, plugins.uglify()))
        .pipe(plugins.if(global.isProduction, plugins.rev()))
        .pipe(gulp.dest(getDir.build(directories.js)))
        .pipe(plugins.if(global.isProduction, plugins.rev.manifest()))
        .pipe(plugins.if(global.isProduction, gulp.dest(getDir.build('rev/libjs'))));

      eventStream.merge(libCssStream, assetsStream, libJsStream);

      deferred.resolve();
    });

    return deferred.promise;
  }
};