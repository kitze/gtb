module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  return function (){
    gulp.src(fileDir('*', 'font'))
      .pipe(gulp.dest(config.dirs.build.font));
  }
};