module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  return function () {
    gulp.src(fileDir('*', 'custom'))
      .pipe(gulp.dest(config.dirs.build.bower));
  }
};