module.exports = function (gulp, plugins, config) {
  require('shelljs/global');

  var bowerFiles = require('main-bower-files');
  var getAdditionalLibraries = require('../../functions/get-additional-libraries')(gulp, plugins, config);
  var _ = require('underscore');
  var map = require('map-stream');
  var path = require('path');
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);
  var fs = require('fs');

  var bowerLibraries = [];
  var bowerFontTemplates =
      {
        bootstrap: {
          name: "bootstrap",
          directory: "fonts",
          escapeUrl: /glyphicons/
        },
        fontAwesome: {
          name: "fontawesome",
          directory: "fonts",
          escapeUrl: /fontawesome/
        }
      };

  function keepOriginal(url) {
    return _.some(config.gulp.additionalBowerFiles.fonts, function (font) {
      return font.escapeUrl.test(url);
    });
  }

  function getFilesFromBower() {
    return _(bowerFiles(config.bower).filter(function (file) {
      return !_.some(config.gulp.additionalBowerFiles.js, function (jsfile) {
        return jsfile.ignoreMain === true && file.indexOf(jsfile.name) !== -1;
      });
    }));
  }

  return function () {
    var jsFilter = plugins.filter('**/*.js'),
        cssFilter = plugins.filter(['*.css', '**/*.css']),
        assetsFilter = plugins.filter(['!**/*.js', '!**/*.css', '!**/*.scss']);

    /* Ignore the files defined in the 'main' property of a bower.json library in
     case we need to use different files from the library (defined in gulp-config.json)
     */

    try {
      bowerDirectory = fs.lstatSync("./" + config.dirs.prefix + config.dirs.bower);
      if (bowerDirectory.isDirectory()) {
        bowerLibraries = getFilesFromBower();
      }
    }
    catch (e) {
      if (!which('bower')) {
        echo('Bower is not installed. Please install it with "npm install -g bower" first');
        exit(-1);
      }
      else {
        cd("./" + config.dirs.prefix);
        exec("bower install");
        cd("..");
        getFilesFromBower();
      }
    }

    /* Get additional files for libraries that are defined in gulp-config.json */
    var bowerAdditional = getAdditionalLibraries(config.gulp.additionalBowerFiles.js);
    var allFiles = _(bowerLibraries).compact().concat(bowerAdditional);

    _.each(allFiles, function (file) {
      _.each(bowerFontTemplates, function (template) {
        if (file.indexOf(template.name) !== -1) {
          config.gulp.additionalBowerFiles.fonts.push(template);
        }
      })
    });

    gulp.src(allFiles)
      .pipe(jsFilter)
      .pipe(plugins.plumber())
      .pipe(plugins.concat('lib.js'))
      .pipe(plugins.if(config.isProduction, plugins.uglify()))
      .pipe(gulp.dest(bdir(config.dirs.js)));

    gulp.src(allFiles)
      .pipe(cssFilter)
      .pipe(map(function (file, callback) {
        var relativePath = path.dirname(path.relative(path.resolve(config.dirs.js), file.path));
        var contents = file.contents.toString().replace(/url\([^)]*\)/g, function (match) {
          // find the url path, ignore quotes in url string
          var matches = /url\s*\(\s*(('([^']*)')|("([^"]*)")|([^'"]*))\s*\)/.exec(match),
              url = matches[3] || matches[5] || matches[6];
          // Don't modify data, http(s) and protocol agnostic urls
          if (/^data:/.test(url) || /^http(:?s)?:/.test(url) || /^\/\//.test(url) || keepOriginal(url))
            return 'url(' + url + ')';
          return 'url(' + path.join(path.relative(config.dirs.js, config.dirs.app), config.dirs.js, relativePath, url) + ')';
        });

        file.contents = new Buffer(contents);

        callback(null, file);
      }))
      .pipe(plugins.concat('lib.css'))
      .pipe(plugins.if(config.isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
      .pipe(gulp.dest(bdir(config.dirs.css)));

    gulp.src(allFiles)
      .pipe(assetsFilter)
      .pipe(gulp.dest(bdir(config.dirs.js)))
      .pipe(assetsFilter.restore())
      .pipe(plugins.connect.reload());
  }
};
