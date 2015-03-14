module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  return function (){
    gulp.src(fileDir('json'))
      .pipe(gulp.dest(config.dirs.build.app))
      .pipe(plugins.connect.reload());
  }
};