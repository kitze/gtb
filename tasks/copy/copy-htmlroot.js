module.exports = function (gulp, plugins, config) {
  var dir = require('../../functions/dir')(config);
  var bdir = require('../../functions/build-dir')(config);

  var minifyHtmlOptions = {
    comments: false,
    quotes: true,
    spare: true,
    empty: true,
    cdata: true
  };
  return function () {
    gulp.src(dir('*.html'))
      .pipe(plugins.if(config.isProduction, plugins.minifyHtml(minifyHtmlOptions)))
      .pipe(gulp.dest(bdir(config.dirs.root)))
      .pipe(plugins.connect.reload());
  }
};