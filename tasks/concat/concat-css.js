module.exports = function (gulp, plugins, config) {
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/build-dir')(config);
  var fileDir = require("../../functions/file-dir")(config);

  return function () {
    var str = [dir(config.dirs.css + '/fonts.css'), config.dirs.prefix + config.dirs.scss + '/application.css'].concat(fileDir("css", "css"));

    gulp.src(str)
      .pipe(plugins.concat('app.css'))
      .pipe(plugins.if(global.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
      .pipe(plugins.autoprefixer())
      .pipe(gulp.dest(bdir(config.dirs.css)))
      .pipe(plugins.connect.reload());
  }
};