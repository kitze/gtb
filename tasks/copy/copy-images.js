module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  var bdir = require('../../functions/build-dir')(config);

  return function () {
    gulp.src(fileDir('*', 'images'))
      .pipe(gulp.dest(bdir(config.dirs.images)));
  }
};