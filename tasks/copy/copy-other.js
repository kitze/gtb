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

    gulp.src(getDir.file(directories.app + '/favicon.ico'))
      .pipe(gulp.dest(getDir.build('')));

    gulp.src(getDir.file(directories.app + '/robots.txt'))
      .pipe(gulp.dest(getDir.build('')));
  }
};