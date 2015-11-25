module.exports = function (gulp) {
  var getDir = require('../../functions/get-dir');
  var directories = require('../../config/directories-config');
  var con = require('../../functions/console');

  return function () {
    con.hint('Copying other files ...');

    gulp.src(getDir.file('CNAME'))
      .pipe(gulp.dest(getDir.build('')));

    gulp.src(getDir.files('*', 'json'))
      .pipe(gulp.dest(getDir.build(directories.json)));

    gulp.src(getDir.file('favicon.ico'))
      .pipe(gulp.dest(getDir.build(directories.root)));

    gulp.src(getDir.file('robots.txt'))
      .pipe(gulp.dest(getDir.build(directories.root)));
  }
};