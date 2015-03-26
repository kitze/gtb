module.exports = function (gulp, plugins, config) {
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);
  var bowerFiles = require('main-bower-files');
  var _ = require('underscore');

  return function () {
    var showError = function (err) {
      console.log('\n SASS file has error clear it to see changes, see below log ------------->>> \n');
      console.log(err);
    };

    var bowerComponentsPath = config.dirs.prefix + config.dirs.bower + "/";
    var includePaths = [bowerComponentsPath];
    var bowerLibraries = bowerFiles(config.bower);


    var sassLibraryMapping = {
      "spinkit": "spinkit/scss/spinners",
      "kitze-helpers": "kitzehelpers/sass"
    };

    _(bowerLibraries).each(function (library) {
      _(sassLibraryMapping).each(function (lib, libKey) {
        if (library.indexOf(libKey) !== -1) {
          includePaths.push(bowerComponentsPath + lib);
        }
      })
    });

    return gulp.src(dir(config.dirs.css + "/application.scss"))
      .pipe(plugins.sass({onError: showError, includePaths: includePaths}))
      .pipe(gulp.dest(config.dirs.prefix + config.dirs.scss + "/"))
      .pipe(plugins.connect.reload());
  }
};