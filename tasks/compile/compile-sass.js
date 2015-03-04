module.exports = function (gulp,plugins,config) {
  return function () {
    var showError = function (err) {
      console.log(errorLog('\n SASS file has error clear it to see changes, see below log ------------->>> \n'));
      console.log(errorLog(err));
    };

    return gulp.src(config.dirs.src.css + 'application.scss')
      .pipe(plugins.sass({includePaths: [config.dirs.src.bower], onError: showError}))
      .pipe(gulp.dest(config.dirs.scss))
      .pipe(plugins.connect.reload());
  }
};