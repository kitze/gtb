module.exports = function (gulp, plugins, config) {

  var fileDir = require("../../functions/file-dir")(config);
  var bdir = require('../../functions/build-dir')(config);

  var minifyHtmlOptions = {
    comments: false,
    quotes: true,
    spare: true,
    empty: true,
    cdata: true
  };

  return function () {
    gulp.src(fileDir('coffee', 'js'))
      .pipe(plugins.plumber())
      .pipe(plugins.coffee({
        bare: false
      }))
      .pipe(plugins.if(global.isProduction, plugins.minifyHtml(minifyHtmlOptions)))
      .pipe(gulp.dest(bdir(config.dirs.js)))
      .pipe(plugins.connect.reload());
  }
};