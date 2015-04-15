module.exports = function (gulp, plugins, config) {
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);
  var bowerFiles = require('main-bower-files');
  var fileDir = require("../../functions/file-dir")(config);
  var _ = require('underscore');
  var getAdditionalLibraries = require('../../functions/get-additional-libraries')(gulp, plugins, config);
  var notifier = require('gulp-notify/node_modules/node-notifier');
  var con = require('../../functions/console');
  var chalk = require('chalk');

  return function () {
    var showError = function (err) {
      var file = err.file.replace(dir(config.dirs.css), '');
      notifier.notify({
        'title': 'SASS error',
        'message': err.message + " at " + file
      });
      con.custom(chalk.red.bold('SASS error: ') + err.message);
      /* Don't show the full size of the path in the error */
      con.custom(chalk.red.bold('File: ') + file);
      con.custom(chalk.red.bold('Position: ') + 'Line:' + err.line + ' Column:' + err.column);
    };

    var bowerComponentsPath = global.prefix + config.dirs.bower + "/";
    var includePaths = [bowerComponentsPath];

    var bowerSettings = {
      paths: {
        "bowerJson": global.prefix + 'bower.json',
        "bowerDirectory": global.prefix + config.dirs.bower
      }
    };

    var bowerLibraries = bowerFiles(bowerSettings);
    var additionalBowerSassFiles = getAdditionalLibraries(config.gulp.additionalBowerFiles, "sass");
    var allBowerFiles = _(bowerLibraries).compact().concat(additionalBowerSassFiles);

    var sassLibraryMapping = {
      "spinkit": "spinkit/scss/spinners",
      "kitze-helpers": "kitze-helpers/sass",
      "bem-constructor": "bem-constructor/dist"
    };

    _(allBowerFiles).each(function (library) {
      _(sassLibraryMapping).each(function (lib, libKey) {
        if (library.indexOf(libKey) !== -1) {
          includePaths.push(bowerComponentsPath + lib);
        }
      })
    });
    var adds = getAdditionalLibraries(config.gulp.additionalBowerFiles, "css");

    gulp.src(dir(config.dirs.css + "/application.scss"))
      .pipe(plugins.cssGlobbing({
        extensions: ['.css', '.scss']
      }))
      .pipe(plugins.sass({onError: showError, includePaths: includePaths}))
      .pipe(plugins.addSrc(fileDir("css", "css")))
      .pipe(plugins.addSrc(adds))
      .pipe(plugins.concat('app.css'))
      .pipe(plugins.if(global.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
      .pipe(plugins.autoprefixer({browsers: ['last 2 version']}))
      .pipe(gulp.dest(bdir(config.dirs.css)))
      .pipe(plugins.connect.reload());
  }
};