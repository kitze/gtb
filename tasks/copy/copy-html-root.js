module.exports = function (gulp, plugins, config) {
  var minifyHtmlOptions = {
    comments: false,
    quotes: true,
    spare: true,
    empty: true,
    cdata: true
  };
  return function () {
    gulp.src(config.dirs.src.app + '*.html')
      .pipe(plugins.if(config.isProduction, plugins.minifyHtml(minifyHtmlOptions)))
      .pipe(gulp.dest(config.dirs.build.app))
      .pipe(plugins.connect.reload());
  }
};