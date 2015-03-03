module.exports = function (gulp, plugins, config) {
  var runSequence = require('run-sequence')
  return function (){
    gulp.task('zip', function () {
      gulp.src([config.dirs.build.app + '*', config.dirs.build.app + '**/*'])
        .pipe(plugins.zip('build-' + Date.now() + '.zip'))
        .pipe(gulp.dest('./zip/'));

      setTimeout(function () {
        runSequence('clean:zip');
      }, 500); // wait for file creation

    });
  }
};