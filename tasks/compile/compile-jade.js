module.exports = function (gulp, plugins, config) {
  var fileDir = require("../../functions/file-dir")(config);
  var minifyHtmlOptions = {
    comments: false,
    quotes: true,
    spare: true,
    empty: true,
    cdata: true
  };

  function compileDirectory(dir, dest) {
    console.log('compiling directory!');
    gulp.src(dir)
      .pipe(plugins.plumber())
      .pipe(plugins.jade({
        pretty: true
      }))
      .pipe(plugins.if(config.isProduction, plugins.minifyHtml(minifyHtmlOptions)))
      .pipe(gulp.dest(config.dirs.build[dest]))
      .pipe(plugins.connect.reload());
  }

  return function () {
    compileDirectory(fileDir('jade', 'templates'), 'templates');
    compileDirectory(fileDir('jade', 'app', false), 'app');
  }
};