module.exports = function (gulp) {
  var getDir = require('../../functions/get-dir');
  var directories = require('../../config/directories-config');
  var con = require('../../functions/console');

  return function () {
    con.hint('Copying other files ...');

    gulp.src(getDir.file('CNAME'))
      .pipe(gulp.dest(getDir.build('')));
  }
};