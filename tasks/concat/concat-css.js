module.exports = function (gulp, plugins, config) {
  return function () {
    gulp.src([config.dirs.src.css + 'fonts.css', config.dirs.scss + 'application.css', config.dirs.src.css + '*.css'])
      .pipe(plugins.concat('styles.css'))
      .pipe(plugins.if(config.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
      .pipe(plugins.if(config.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
      .pipe(gulp.dest(config.dirs.build.css))
      .pipe(plugins.connect.reload());
  }
};