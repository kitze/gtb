module.exports = function (gulp, plugins, config) {

  var bdir = require('../../functions/build-dir')(config);
  var fileDir = require('../../functions/file-dir')(config);
  var pngquant = require('imagemin-pngquant');
  var con = require('../../functions/console');

  return function () {
    con.hint('Processing images ...');

    return gulp.src(fileDir('*', 'images'))
      .pipe(plugins.imagemin({
        progressive: true,
        use: [pngquant()],
        verbose: undefined
      }))
      .pipe(gulp.dest(bdir(config.dirs.images)));
  }
};