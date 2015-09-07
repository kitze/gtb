module.exports = function (gulp) {

  var getDir = require('../../functions/get-dir');
  var con = require('../../functions/console');
  var merge = require('merge-stream');
  var directories = require('../../config/directories-config');

  return function () {
    con.hint("Processing fonts ...");

    var font = gulp.src(getDir.files('*', 'font'))
      .pipe(gulp.dest(getDir.build(directories.font)));

    var fonts = gulp.src(getDir.files('*', 'fonts'))
      .pipe(gulp.dest(getDir.build(directories.fonts)));

    return merge(font, fonts);

  }
};