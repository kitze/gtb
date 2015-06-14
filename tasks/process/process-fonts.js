module.exports = function (gulp, plugins, config) {

  var _ = require('underscore');
  var fileDir = require('../../functions/file-dir')(config);
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);
  var con = require('../../functions/console');

  return function () {
    con.hint("Processing fonts ...");

    gulp.src(fileDir('*', 'font'))
      .pipe(gulp.dest(bdir(config.dirs.font)));

    gulp.src(fileDir('*', 'fonts'))
      .pipe(gulp.dest(bdir(config.dirs.fonts)));

  }
};