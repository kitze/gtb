module.exports = function (gulp, plugins, config) {

  var getAllBowerFiles = require('../../functions/get-all-bower-files')(gulp, plugins, config);
  var getAdditionalFonts = require('../../functions/get-additional-fonts')(gulp, plugins, config);
  var _ = require('underscore');
  var map = require('map-stream');
  var path = require('path');
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);
  var notifier = require('gulp-notify/node_modules/node-notifier');
  var con = require('../../functions/console');

  var jsFilter     = plugins.filter('**/*.js'),
      cssFilter    = plugins.filter(['*.css', '**/*.css']),
      assetsFilter = plugins.filter(['!**/*.js', '!**/*.css', '!**/*.scss']);

  var additionalFonts = [];

  function keepOriginal(url) {
    return _.some(additionalFonts, function (font) {
      return font.escapeUrl.test(url);
    });
  }

  return function () {

    con.hint('Processing bower ... ');

    getAllBowerFiles().then(function (bowerFiles) {

      additionalFonts = getAdditionalFonts(bowerFiles);

      var fontsFromBower = _.map(additionalFonts, function (fontLibrary) {
        return global.prefix + config.dirs.bower + "/" + fontLibrary.name + "/" + fontLibrary.directory + "/" + "*";
      });

      if (fontsFromBower.length > 0) {
        gulp.src(fontsFromBower)
          .pipe(gulp.dest(bdir(config.dirs.fonts)));
      }

      /* Get CSS files from bower directory */
      gulp.src(bowerFiles)
        .pipe(cssFilter)
        .pipe(map(function (file, callback) {
          var relativePath = path.dirname(path.relative(path.resolve(config.dirs.js), file.path));
          var contents = file.contents.toString().replace(/url\([^)]*\)/g, function (match) {
            // find the url path, ignore quotes in url string
            var matches = /url\s*\(\s*(('([^']*)')|("([^"]*)")|([^'"]*))\s*\)/.exec(match),
                url     = matches[3] || matches[5] || matches[6];
            // Don't modify data, http(s) and protocol agnostic urls
            if (/^data:/.test(url) || /^http(:?s)?:/.test(url) || /^\/\//.test(url) || keepOriginal(url))
              return 'url(' + url + ')';
            return 'url(' + path.join(path.relative(config.dirs.js, config.dirs.app), config.dirs.js, relativePath, url) + ')';
          });
          file.contents = new Buffer(contents);
          callback(null, file);
        }))
        .pipe(plugins.concat('lib.css'))
        .pipe(plugins.if(global.isProduction, plugins.rev()))
        .pipe(plugins.if(global.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
        .pipe(gulp.dest(bdir(config.dirs.css)))
        .pipe(plugins.if(global.isProduction,plugins.rev.manifest()))
        .pipe(plugins.if(global.isProduction,gulp.dest( bdir('rev/libcss'))));

      gulp.src(bowerFiles)
        .pipe(assetsFilter)
        .pipe(gulp.dest(bdir(config.dirs.js)))
        .pipe(assetsFilter.restore());

      /* Get JS files from bower directory */
      return gulp.src(bowerFiles)
        .pipe(jsFilter)
        .pipe(plugins.concat('lib.js'))
        .pipe(plugins.ngAnnotate()) // annotate them in case we're using angular
        .pipe(plugins.if(global.isProduction, plugins.uglify()))
        .pipe(plugins.if(global.isProduction, plugins.rev()))
        .pipe(gulp.dest(bdir(config.dirs.js)))
        .pipe(plugins.if(global.isProduction, plugins.rev.manifest() ))
        .pipe(plugins.if(global.isProduction, gulp.dest( bdir('rev/libjs') )))
        .pipe(plugins.connect.reload());
    });
  }
};
