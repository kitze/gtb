module.exports = function (gulp, plugins, config) {
  var _ = require('underscore');
  var fileDir = require('../../functions/file-dir')(config);
  return function () {
    var allFonts = fileDir('*', 'fonts').concat(_.map(config.gulp.additionalBowerFiles.fonts, function (fontLibrary) {
      return config.dirs.src.bower + fontLibrary.name + "/" + fontLibrary.directory + "/" + "*"
    }));
    gulp.src(allFonts)
      .pipe(gulp.dest(config.dirs.build.fonts));
  }
};