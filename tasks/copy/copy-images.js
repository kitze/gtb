module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  return function () {
    gulp.src(fileDir('*', 'images'))
      .pipe(gulp.dest(config.dirs.build.images));
  }
};