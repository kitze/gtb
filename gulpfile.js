var gulp        = require('gulp'),
    bowerFiles  = require('main-bower-files'),
    path        = require('path'),
    fs          = require('fs'),
    chalk       = require('chalk'),
    _           = require('underscore'),
    args        = require('yargs').argv,
    map         = require('map-stream'),
    runSequence = require('run-sequence'),
    plugins     = require('gulp-load-plugins')();

var errorLog  = chalk.red.bold,
    hintLog   = chalk.blue,
    changeLog = chalk.red;

var bowerFontTemplates =
    {
      bootstrap: {
        name: "bootstrap",
        directory: "fonts",
        escapeUrl: /glyphicons/
      },
      fontAwesome: {
        name: "components-font-awesome",
        directory: "fonts",
        escapeUrl: /fontawesome/
      }
    };

var gulpConfig = JSON.parse(fs.readFileSync('gulp-config.json', 'utf8'));
if (!fs.existsSync('custom-gulp-config.json')) {
  fs.writeFileSync('custom-gulp-config.json', fs.readFileSync('custom-gulp-template.json'));
}

gulpConfig = _.extend(gulpConfig, JSON.parse(fs.readFileSync('custom-gulp-config.json', 'utf8')));

var dependencies = _(gulpConfig.dependencies).filter(function (dependency) {
  return isProduction === true || gulpConfig.ignore !== true || gulpConfig.ignoredFiles.dependencies.indexOf(dependency) === -1;
});

var replacements = [
  ["G_SERVER_PORT", gulpConfig.serverPort],
  ["G_DEPENDENCIES", JSON.stringify(dependencies)]
];

var SETTINGS = {
  src: {
    app: 'app/',
    css: 'app/css/',
    js: 'app/js/',
    templates: 'app/templates/',
    images: 'app/' + gulpConfig.imagesFolder + "/",
    custom: 'app/custom/',
    fonts: 'app/fonts/',
    json: 'app/json',
    font: 'app/font/',
    bower: 'bower_components/'
  },
  build: {
    app: 'build/',
    css: 'build/css/',
    js: 'build/js/',
    json: 'build/json',
    templates: 'build/templates/',
    images: 'build/' + gulpConfig.imagesFolder + '/',
    fonts: 'build/fonts/',
    font: 'build/font/',
    bower: 'build/js/'
  },
  scss: 'scss/'
};

var bowerConfig = {
  paths: {
    bowerDirectory: SETTINGS.src.bower,
    bowerrc: '.bowerrc',
    bowerJson: 'bower.json'
  }
};

//server and live reload config
var serverConfig = {
  root: SETTINGS.build.app,
  host: 'localhost',
  livereload: gulpConfig.liveReload,
  middleware: function () {
    return [function (req, res, next) {
      if (req.url.indexOf('.') === -1)
        fs.createReadStream(SETTINGS.build.app + "index.html").pipe(res);
      return next();

    }];
  },
  port: gulpConfig.serverPort
};

// Flag for generating production code.
var isProduction = args.type === 'production';

/*============================================================
 =>                          Load all gulp tasks
 ============================================================*/

var gulpTasksFolder = './tasks';
var config = function () {
  return {
    server: serverConfig,
    gulp: gulpConfig,
    dirs: SETTINGS,
    isProduction: isProduction
  };
};

function getTask(task) {
  return require(gulpTasksFolder + "/" + task)(gulp, plugins, config());
}

/* Task List */

gulp.task('server', getTask('server'));
gulp.task('image:min', getTask('image-min'));
gulp.task('convert:scss', getTask('convert-scss'));
gulp.task('zip', getTask('zip'));
gulp.task('clean', getTask('clean'));
gulp.task('clean:zip', getTask('clean-zip'));
gulp.task('delete:build', getTask('delete-build'));
gulp.task('hash', getTask('hash'));
gulp.task('copy:build', getTask('copy-build-to-destination'));
gulp.task('compile:jade', getTask('compile-jade'));
gulp.task('compile:coffee', getTask('compile-coffee'));

gulp.task('tasks', plugins.taskListing);

/*============================================================
 =                          Concat                           =
 ============================================================*/

gulp.task('concat', ['concat:bower', 'concat:js', 'concat:css', 'copy:fonts']);

function getAdditionalLibraries(obj) {
  var libs = [];
  _.each(obj, function (library) {
    _.each(library.files, function (file) {
      libs.push(SETTINGS.src.bower + library.name + "/" + file);
    });
  });
  return libs;
}

gulp.task('concat:bower', function () {
  console.log('-------------------------------------------------- CONCAT :bower');

  function keepOriginal(url) {
    return _.some(gulpConfig.additionalBowerFiles.fonts, function (font) {
      return font.escapeUrl.test(url);
    });
  }

  var jsFilter = plugins.filter('**/*.js'),
      cssFilter = plugins.filter('**/*.css'),
      assetsFilter = plugins.filter(['!**/*.js', '!**/*.css', '!**/*.scss']);

  /**
   * Ignore the files defined in the 'main' property of a bower.json library in case we need to use different files from the library (defined in gulp-config.json)
   */
  var bowerLibraries = _(bowerFiles(bowerConfig).filter(function (file) {
    return !_.some(gulpConfig.additionalBowerFiles.js, function (jsfile) {
      return jsfile.ignoreMain === true && file.indexOf(jsfile.name) !== -1;
    });
  }));

  /**
   * Get additional files for libraries that are defined in gulp-config.json
   */
  var bowerAdditional = getAdditionalLibraries(gulpConfig.additionalBowerFiles.js);
  var allFiles = _(bowerLibraries).compact().concat(bowerAdditional);

  _.each(allFiles, function (file) {
    _.each(bowerFontTemplates, function (template) {
      if (file.indexOf(template.name) !== -1) {
        gulpConfig.additionalBowerFiles.fonts.push(template);
      }
    })
  });

  var stream = gulp.src(allFiles, {base: SETTINGS.src.bower})
    .pipe(jsFilter)
    .pipe(plugins.concat('lib.js'))
    .pipe(plugins.if(isProduction, plugins.uglify()))
    .pipe(gulp.dest(SETTINGS.build.bower))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe(map(function (file, callback) {
      var relativePath = path.dirname(path.relative(path.resolve(SETTINGS.src.bower), file.path));
      // CSS path resolving
      // Taken from https://github.com/enyojs/enyo/blob/master/tools/minifier/minify.js
      var contents = file.contents.toString().replace(/url\([^)]*\)/g, function (match) {
        // find the url path, ignore quotes in url string
        var matches = /url\s*\(\s*(('([^']*)')|("([^"]*)")|([^'"]*))\s*\)/.exec(match),
            url = matches[3] || matches[5] || matches[6];
        // Don't modify data, http(s) and protocol agnostic urls
        if (/^data:/.test(url) || /^http(:?s)?:/.test(url) || /^\/\//.test(url) || keepOriginal(url))
          return 'url(' + url + ')';
        return 'url(' + path.join(path.relative(SETTINGS.build.bower, SETTINGS.build.app), SETTINGS.build.bower, relativePath, url) + ')';
      });
      file.contents = new Buffer(contents);

      callback(null, file);
    }))
    .pipe(plugins.concat('lib.css'))
    .pipe(plugins.if(isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
    .pipe(gulp.dest(SETTINGS.build.css))
    .pipe(cssFilter.restore())
    .pipe(assetsFilter)
    .pipe(gulp.dest(SETTINGS.build.bower))
    .pipe(assetsFilter.restore())
    .pipe(plugins.connect.reload());
  return stream;
});

gulp.task('concat:js', function () {

  console.log('-------------------------------------------------- CONCAT :js');
  gulp.src([SETTINGS.src.js + 'plugins/*.js', SETTINGS.src.js + 'app.js', SETTINGS.src.js + '*.js', SETTINGS.src.js + '**/*.js'])
    .pipe(plugins.concat('app.js'))
    .pipe(plugins.if(isProduction, plugins.ngmin({dynamic: false})))
    .pipe(plugins.if(isProduction, plugins.uglify()))
    .pipe(gulp.dest(SETTINGS.build.js))
    .pipe(plugins.connect.reload());
});


gulp.task('concat:css', ['convert:scss'], function () {

  console.log('-------------------------------------------------- CONCAT :css ');
  gulp.src([SETTINGS.src.css + 'fonts.css', SETTINGS.scss + 'application.css', SETTINGS.src.css + '*.css'])
    .pipe(plugins.concat('styles.css'))
    .pipe(plugins.if(isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
    .pipe(plugins.if(isProduction, plugins.minifyCss({keepSpecialComments: '*'})))
    .pipe(gulp.dest(SETTINGS.build.css))
    .pipe(plugins.connect.reload());
});

/*============================================================
 =                           Copy                            =
 ============================================================*/

gulp.task('copy', ['copy:html', 'copy:custom', 'copy:images', 'copy:json', 'copy:fonts', 'copy:font', 'copy:html:root']);

gulp.task('copy:custom', function () {
  console.log('-------------------------------------------------- COPY :custom');
  gulp.src([SETTINGS.src.custom + '*.*', SETTINGS.src.custom + '**/*.*'])
    .pipe(gulp.dest(SETTINGS.build.bower));
});

gulp.task('copy:json', function () {
  console.log('-------------------------------------------------- COPY :json');
  gulp.src([SETTINGS.src.json + '*.*', SETTINGS.src.json + '**/*.*'])
    .pipe(gulp.dest(SETTINGS.build.app))
    .pipe(plugins.connect.reload());
});

gulp.task('copy:html', function () {
  console.log('-------------------------------------------------- COPY :html');
  gulp.src([SETTINGS.src.templates + '*.html', SETTINGS.src.templates + '**/*.html'])
    .pipe(plugins.if(isProduction, plugins.minifyHtml({
      comments: false,
      quotes: true,
      spare: true,
      empty: true,
      cdata: true
    })))
    .pipe(gulp.dest(SETTINGS.build.templates))
    .pipe(plugins.connect.reload());
});

gulp.task('copy:html:root', function () {
  console.log('-------------------------------------------------- COPY :html:root');
  gulp.src(SETTINGS.src.app + '*.html')
    .pipe(plugins.if(isProduction, plugins.minifyHtml({
      comments: false,
      quotes: true,
      spare: true,
      empty: true,
      cdata: true
    })))
    .pipe(gulp.dest(SETTINGS.build.app))
    .pipe(plugins.connect.reload());
});

gulp.task('copy:images', function () {
  console.log('-------------------------------------------------- COPY :images');
  gulp.src([SETTINGS.src.images + '*.*', SETTINGS.src.images + '**/*.*'])
    .pipe(gulp.dest(SETTINGS.build.images));
});

gulp.task('copy:fonts', function () {
  console.log('-------------------------------------------------- COPY :fonts');
  var allFonts = [SETTINGS.src.fonts + '*', SETTINGS.src.fonts + '**/*'].concat(_.map(gulpConfig.additionalBowerFiles.fonts, function (fontLibrary) {
    return SETTINGS.src.bower + fontLibrary.name + "/" + fontLibrary.directory + "/" + "*"
  }));
  gulp.src(allFonts)
    .pipe(gulp.dest(SETTINGS.build.fonts));
});

gulp.task('copy:font', function () {
  console.log('-------------------------------------------------- COPY :fonts');
  gulp.src([SETTINGS.src.font + '*', SETTINGS.src.font + '**/*'])
    .pipe(gulp.dest(SETTINGS.build.font));
});


/*=========================================================================================================
 =												Watch
 =========================================================================================================*/

gulp.task('watch', function () {

  console.log('watching all the files.....');

  var watchedFiles = [];

  watchedFiles.push(gulp.watch([SETTINGS.src.css + '*.css', SETTINGS.src.css + '**/*.css'], ['concat:css']));

  watchedFiles.push(gulp.watch([SETTINGS.src.css + '*.scss', SETTINGS.src.css + '**/*.scss', SETTINGS.src.css + '*.sass', SETTINGS.src.css + '**/*.sass'], ['concat:css']));

  watchedFiles.push(gulp.watch([SETTINGS.src.js + '*.js', SETTINGS.src.js + '**/*.js'], ['concat:js']));

  watchedFiles.push(gulp.watch([SETTINGS.src.app + '*.html', SETTINGS.src.app + '**/*.html'], ['copy:html:root']));

  watchedFiles.push(gulp.watch([SETTINGS.src.images + '*.*', SETTINGS.src.images + '**/*.*'], ['copy:images']));

  watchedFiles.push(gulp.watch([SETTINGS.src.fonts + '*.*', SETTINGS.src.fonts + '**/*.*'], ['copy:fonts']));

  watchedFiles.push(gulp.watch([SETTINGS.src.bower + '*.js', SETTINGS.src.bower + '**/*.js'], ['concat:bower']));

  watchedFiles.push(gulp.watch([SETTINGS.src.templates + '*.html', SETTINGS.src.templates + '**/*.html'], ['copy:html']));

  watchedFiles.push(gulp.watch([SETTINGS.src.json + '*.json', SETTINGS.src.json + '**/*.json'], ['copy:json']));


  // Just to add log messages on Terminal, in case any file is changed
  var onChange = function (event) {
    if (event.type === 'deleted') {
      runSequence('clean');
      setTimeout(function () {
        runSequence('copy', 'concat', 'watch');
      }, 500);
    }
    console.log(changeLog('-------------------------------------------------->>>> File ' + event.path + ' was ------->>>> ' + event.type));
  };

  watchedFiles.forEach(function (watchedFile) {
    watchedFile.on('change', onChange);
  });

});

/*============================================================
 =                             Start                          =
 ============================================================*/

/**
 * Delete build folder, copy, minify, annotate and hash everything, then copy it to the destination folder
 */

gulp.task('build:prod', function () {
  console.log(hintLog('-------------------------------------------------- BUILD - Full Production Mode'));
  isProduction = true;
  runSequence(
    'delete-build-folder',
    'copy',
    'concat',
    'hash',
    'copy-build-to-destination'
  );
});

/**
 * Builds the version without hash and delete-build-folder (linux only)
 */
gulp.task('build:windows', function () {
  console.log(hintLog('-------------------------------------------------- BUILD - Windows Mode'));
  isProduction = true;
  runSequence(
    'copy',
    'concat',
    'copy-build-to-destination'
  );
});

gulp.task('build:only', function () {
  console.log(hintLog('-------------------------------------------------- BUILD - Windows Mode (without copy to destination folder)'));
  isProduction = true;
  runSequence(
    'copy',
    'concat'
  );
});

/**
 * Run the minified site in production mode without hashing anything and copying to the destination folder
 */
gulp.task('run:prod', function () {
  console.log(hintLog('-------------------------------------------------- RUN - Full Production Mode'));
  isProduction = true;
  runSequence(
    'copy',
    'concat',
    'watch',
    'server'
  );
});

/**
 * Builds the app and runs the server without minifying or copying anything
 */

gulp.task('default', ['build', 'server']);
