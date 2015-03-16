module.exports = function (gulp,plugins,config) {
  var bdir = require('../functions/build-dir')(config);
  var fileDir = require('../functions/file-dir')(config);

  return function (){
    gulp.src(fileDir('*', 'images'))
      .pipe(plugins.imagemin())
      .pipe(gulp.dest(bdir(config.dirs.images)))
      .pipe(plugins.connect.reload());
  }
};