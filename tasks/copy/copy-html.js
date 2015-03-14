module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  var bdir = require('../../functions/build-dir')(config);

  var minifyHtmlOptions = {
    comments: false,
    quotes: true,
    spare: true,
    empty: true,
    cdata: true
  };
  return function () {
    gulp.src(fileDir('html', 'templates'))
      .pipe(plugins.if(config.isProduction, plugins.minifyHtml(minifyHtmlOptions)))
      .pipe(gulp.dest(bdir(config.dirs.templates)))
      .pipe(plugins.connect.reload());
  }
};