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
      .pipe(plugins.if(global.isProduction, plugins.minifyHtml(minifyHtmlOptions)))
      .pipe(gulp.dest(bdir(dest)))
      .pipe(plugins.connect.reload());
  }

  return function () {
    compileDirectory(fileDir('jade', 'templates'), config.dirs.templates); /* compile everything in the templates folder */
    compileDirectory(fileDir('jade', '', false), ''); /* compile everything in the root folder */
  }
};