module.exports = function (gulp, plugins, config) {
  var _ = require('underscore');
  var fileDir = require('../../functions/file-dir')(config);
  var dir = require('../../functions/dir')(config);
  var bdir = require('../../functions/build-dir')(config);

  return function () {
    /* join the fonts from the fonts folder with those listed in additionalBowerFiles */
    var allFonts = fileDir('*', 'fonts').concat(_.map(config.gulp.additionalBowerFiles.fonts, function (fontLibrary) {
      return dir(config.dirs.bower + fontLibrary.name + "/" + fontLibrary.directory + "/" + "*")
    }));

    gulp.src(allFonts)
      .pipe(gulp.dest(bdir(config.dirs.fonts)));
  }
};