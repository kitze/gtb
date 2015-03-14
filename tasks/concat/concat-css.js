module.exports = function (gulp, plugins, config) {
  var bdir = require('../../functions/build-dir')(config);
  var fileDir = require("../../functions/file-dir")(config);

  return function () {
    gulp.src([config.dirs.css + 'fonts.css', config.dirs.scss + 'application.css'].concat(fileDir("css", "css")))
      .pipe(plugins.concat('styles.css'))
      .pipe(plugins.if(config.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
      .pipe(plugins.if(config.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
      .pipe(gulp.dest(bdir(config.dirs.css)))
      .pipe(plugins.connect.reload());
  }
};