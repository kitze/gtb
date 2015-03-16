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

  function compileDirectory(dir, dest) {
    gulp.src(dir)
      .pipe(plugins.plumber())
      .pipe(plugins.jade({
        pretty: true
      }))
      .pipe(plugins.if(config.isProduction, plugins.minifyHtml(minifyHtmlOptions)))
      .pipe(gulp.dest(bdir(config.dirs[dest])))
      .pipe(plugins.connect.reload());
  }

  return function () {
    compileDirectory(fileDir('jade', 'templates'), 'templates');
    compileDirectory(fileDir('jade', 'app', false), 'app');
  }
};