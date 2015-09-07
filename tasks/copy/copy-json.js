module.exports = function (gulp, plugins, config) {
  var getDir = require('../../functions/get-dir');
  var directories = require('../../config/directories-config');

  // Copies json directory to build directory
  return function () {
    gulp.src(getDir.files('json'))
      .pipe(gulp.dest(getDir.build(directories.json)))
      .pipe(plugins.connect.reload());
  }
};