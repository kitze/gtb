var pngquant = require('imagemin-pngquant');

module.exports = function (gulp, plugins) {

  var getDir = require('../../functions/get-dir');
  var con = require('../../functions/console');
  var directories = require('../../config/directories-config');
  var browserSync = require('../../classes/browser-sync');

  return function () {
    con.hint('Processing images ...');

    return gulp.src(getDir.files('*', 'images'))
      .on('end', function () {
        browserSync.server.reload();
      })
      .pipe(plugins.if(global.isProduction, plugins.imagemin({
        progressive: true,
        use: [pngquant()],
        verbose: undefined
      })))
      .pipe(gulp.dest(getDir.build(directories.images)));
  }
};