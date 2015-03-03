module.exports = function (gulp,plugins,config) {
  return function (){
    gulp.src(config.dirs.src.images + '**')
      .pipe(plugins.imagemin())
      .pipe(gulp.dest(config.dirs.build.images))
      .pipe(plugins.connect.reload());
  }
};