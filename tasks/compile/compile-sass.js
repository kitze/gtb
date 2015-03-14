module.exports = function (gulp,plugins,config) {
  return function () {
    var showError = function (err) {
      console.log('\n SASS file has error clear it to see changes, see below log ------------->>> \n');
      console.log(err);
    };

    return gulp.src(config.dirs.prefix + config.dirs.css + 'application.scss')
      .pipe(plugins.sass({includePaths: [config.dirs.bower], onError: showError}))
      .pipe(gulp.dest(config.dirs.scss))
      .pipe(plugins.connect.reload());
  }
};