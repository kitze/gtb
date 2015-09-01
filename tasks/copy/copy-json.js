module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  var bdir = require('../../functions/build-dir')(config);

  // Copies json directory to build directory
  return function (){
    gulp.src(fileDir('json'))
      .pipe(gulp.dest(bdir(config.dirs.json)))
      .pipe(plugins.connect.reload());
  }
};