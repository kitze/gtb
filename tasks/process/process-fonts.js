module.exports = function (gulp, plugins, config) {

  var fileDir = require('../../functions/file-dir')(config);
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);
  var con = require('../../functions/console');
  var merge = require('merge-stream');

  return function () {
    con.hint("Processing fonts ...");

    var font = gulp.src(fileDir('*', 'font'))
      .pipe(gulp.dest(bdir(config.dirs.font)));

    var fonts = gulp.src(fileDir('*', 'fonts'))
      .pipe(gulp.dest(bdir(config.dirs.fonts)));

    return merge(font, fonts);

  }
};