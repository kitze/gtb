module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  console.log('file dir is', fileDir('html','templates'));
  var minifyHtmlOptions = {
    comments: false,
    quotes: true,
    spare: true,
    empty: true,
    cdata: true
  };
  return function () {
    var fd = fileDir('html', 'templates');
    console.log('fd',fd);
    gulp.src(fd)
      .pipe(plugins.if(config.isProduction, plugins.minifyHtml(minifyHtmlOptions)))
      .pipe(gulp.dest(config.dirs.build.templates))
      .pipe(plugins.connect.reload());
  }
};