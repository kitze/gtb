module.exports = function (gulp, plugins, config) {
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);
  var bowerFiles = require('main-bower-files');
  var fileDir = require("../../functions/file-dir")(config);
  var _ = require('underscore');
  var getAdditionalLibraries = require('../../functions/get-additional-libraries')(gulp, plugins, config);

  return function () {
    var showError = function (err) {
      console.log('\n SASS file has error clear it to see changes, see below log ------------->>> \n');
      console.log(err);
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
    var bowerAdditional = getAdditionalLibraries(config.gulp.additionalBowerFiles, "sass");
    var allBowerFiles = _(bowerLibraries).compact().concat(bowerAdditional);

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

    gulp.src(dir(config.dirs.css + "/application.scss"))
      .pipe(plugins.sass({onError: showError, includePaths: includePaths}))
      .pipe(plugins.addSrc(fileDir("css", "css")))
      .pipe(plugins.concat('app.css'))
      .pipe(plugins.if(global.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
      .pipe(plugins.autoprefixer({browsers: ['last 2 version']}))
      .pipe(gulp.dest(bdir(config.dirs.css)))
      .pipe(plugins.connect.reload());
  }
};