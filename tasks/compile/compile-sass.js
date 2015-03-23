module.exports = function (gulp, plugins, config) {
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);

  return function () {
    var showError = function (err) {
      console.log('\n SASS file has error clear it to see changes, see below log ------------->>> \n');
      console.log(err);
    };

    return gulp.src(dir(config.dirs.css + "/application.scss"))
      .pipe(plugins.sass({onError: showError}))
      .pipe(gulp.dest(config.dirs.prefix + config.dirs.scss + "/"))
      .pipe(plugins.connect.reload());
  }
};