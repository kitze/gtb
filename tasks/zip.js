module.exports = function (gulp, plugins, config) {
  var runSequence = require('run-sequence');
  var fileDir = require('../functions/file-dir')(config);
  var bdir = require('../functions/build-dir')(config);

  return function (){
    gulp.task('zip', function () {
      gulp.src(fileDir('*',''))
        .pipe(plugins.zip('build-' + Date.now() + '.zip'))
        .pipe(gulp.dest(bdir(config.dirs.zip)));

      setTimeout(function () {
        runSequence('clean:zip');
      }, 500); // wait for file creation

    });
  }
};