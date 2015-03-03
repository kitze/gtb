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

/*random change*/
var gulp = require('gulp'),
    bowerFiles = require('main-bower-files'),
    path = require('path'),
    open = require('open'),
    fs = require('fs'),
    chalk = require('chalk'),
    _ = require('underscore'),
    args = require('yargs').argv,
    map = require('map-stream'),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    ncp = require('ncp').ncp,
    exec = require('child_process').exec,
    gulpPlugins = require('gulp-load-plugins')(),
    del = require('del');

var errorLog = chalk.red.bold,
    hintLog = chalk.blue,
    changeLog = chalk.red;

var gulpConfig = JSON.parse(fs.readFileSync('gulp-config.json', 'utf8'));

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

    livereload: true,
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
 =>                          Server
 ============================================================*/

gulp.task('server', function () {

    console.log('------------------>>>> firing server  <<<<-----------------------');
    gulpPlugins.connect.server(serverConfig);

    console.log('Started connect web server on http://localhost:' + serverConfig.port + '.');
    if(gulpConfig.openAfterLaunch) {
        open('http://localhost:' + serverConfig.port);
    }
});

gulp.task('tasks', gulpPlugins.taskListing);

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

    var jsFilter = gulpPlugins.filter('**/*.js'),
        cssFilter = gulpPlugins.filter('**/*.css'),
        assetsFilter = gulpPlugins.filter(['!**/*.js', '!**/*.css', '!**/*.scss']);

    /**
     * Ignore the files defined in the 'main' property of a bower.json library in case we need to use different files from the library (defined in gulp-config.json)
     */
    var bowerLibraries = _(bowerFiles(bowerConfig).filter(function(file){
        return !_.some(gulpConfig.additionalBowerFiles.js, function(jsfile){
             return jsfile.ignoreMain === true && file.indexOf(jsfile.name)!==-1;
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
        .pipe(gulpPlugins.concat('lib.js'))
        .pipe(gulpPlugins.if(isProduction, gulpPlugins.uglify()))
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
        .pipe(gulpPlugins.concat('lib.css'))
        .pipe(gulpPlugins.if(isProduction, gulpPlugins.minifyCss({keepSpecialComments: '*'})))
        .pipe(gulp.dest(SETTINGS.build.css))
        .pipe(cssFilter.restore())
        .pipe(assetsFilter)
        .pipe(gulp.dest(SETTINGS.build.bower))
        .pipe(assetsFilter.restore())
        .pipe(gulpPlugins.connect.reload());
    return stream;
});

gulp.task('concat:js', function () {

    console.log('-------------------------------------------------- CONCAT :js');
    gulp.src([SETTINGS.src.js + 'plugins/*.js', SETTINGS.src.js + 'app.js', SETTINGS.src.js + '*.js', SETTINGS.src.js + '**/*.js'])
        .pipe(gulpPlugins.concat('app.js'))
        .pipe(gulpPlugins.if(isProduction, gulpPlugins.ngmin({dynamic: false})))
        .pipe(gulpPlugins.if(isProduction, gulpPlugins.uglify()))
        .pipe(gulp.dest(SETTINGS.build.js))
        .pipe(gulpPlugins.connect.reload());
});

gulp.task('convert:scss', function () {
    console.log('-------------------------------------------------- COVERT - scss');

    // Callback to show sass error
    var showError = function (err) {
        console.log(errorLog('\n SASS file has error clear it to see changes, see below log ------------->>> \n'));
        console.log(errorLog(err));
    };

    var stream = gulp.src(SETTINGS.src.css + 'application.scss')
        .pipe(gulpPlugins.sass({includePaths: [SETTINGS.src.bower], onError: showError}))
        .pipe(gulp.dest(SETTINGS.scss))
        .pipe(gulpPlugins.connect.reload());
    return stream;
});

gulp.task('concat:css', ['convert:scss'], function () {

    console.log('-------------------------------------------------- CONCAT :css ');
    gulp.src([SETTINGS.src.css + 'fonts.css', SETTINGS.scss + 'application.css', SETTINGS.src.css + '*.css'])
        .pipe(gulpPlugins.concat('styles.css'))
        .pipe(gulpPlugins.if(isProduction, gulpPlugins.minifyCss({keepSpecialComments: '*'})))
        .pipe(gulpPlugins.if(isProduction, gulpPlugins.minifyCss({keepSpecialComments: '*'})))
        .pipe(gulp.dest(SETTINGS.build.css))
        .pipe(gulpPlugins.connect.reload());
});


/*============================================================
 =                          Minify				            =
 ============================================================*/

gulp.task('image:min', function () {
    gulp.src(SETTINGS.src.images + '**')
        .pipe(gulpPlugins.imagemin())
        .pipe(gulp.dest(SETTINGS.build.images))
        .pipe(gulpPlugins.connect.reload());
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
        .pipe(gulpPlugins.connect.reload());
});

gulp.task('copy:html', function () {
    console.log('-------------------------------------------------- COPY :html');
    gulp.src([SETTINGS.src.templates + '*.html', SETTINGS.src.templates + '**/*.html'])
        .pipe(gulpPlugins.if(isProduction, gulpPlugins.minifyHtml({
            comments: false,
            quotes: true,
            spare: true,
            empty: true,
            cdata: true
        })))
        .pipe(gulp.dest(SETTINGS.build.templates))
        .pipe(gulpPlugins.connect.reload());
});

gulp.task('copy:html:root', function () {
    console.log('-------------------------------------------------- COPY :html:root');
    gulp.src(SETTINGS.src.app + '*.html')
        .pipe(gulpPlugins.if(isProduction, gulpPlugins.minifyHtml({
            comments: false,
            quotes: true,
            spare: true,
            empty: true,
            cdata: true
        })))
        .pipe(gulp.dest(SETTINGS.build.app))
        .pipe(gulpPlugins.connect.reload());
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
 =                             Clean                          =
 ============================================================*/

var cleanFiles = function (files, logMessage) {
    console.log('-------------------------------------------------- CLEAN :' + logMessage);
    del(files);
};

gulp.task('clean', function () {
    cleanFiles([SETTINGS.build.app], 'all files');
});

gulp.task('clean:css', function () {
    cleanFiles([SETTINGS.build.css], 'css');
});

gulp.task('clean:js', function () {
    cleanFiles([SETTINGS.build.js], 'js');
});

gulp.task('clean:html', function () {
    cleanFiles([SETTINGS.build.templates], 'html');
});

gulp.task('clean:images', function () {
    cleanFiles([SETTINGS.build.images], 'images');
});

gulp.task('clean:fonts', function () {
    cleanFiles([SETTINGS.build.fonts + '*.*', SETTINGS.build.fonts + '**/*.*'], 'fonts');
});

gulp.task('clean:zip', function () {
    cleanFiles(['zip/**/*', '!zip/build-*.zip'], 'zip');
});


/*============================================================
 =                             Zip                          =
 ============================================================*/

gulp.task('zip', function () {
    gulp.src([SETTINGS.build.app + '*', SETTINGS.build.app + '**/*'])
        .pipe(gulpPlugins.zip('build-' + Date.now() + '.zip'))
        .pipe(gulp.dest('./zip/'));

    setTimeout(function () {
        runSequence('clean:zip');
    }, 500); // wait for file creation

});

/*============================================================
 =                             Start                          =
 ============================================================*/

var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

gulp.task('hash', function () {
    exec("./minify.sh", function (error, stdout, stderr) {      // one easy function to capture data/errors
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null)
            console.log('exec error: ' + error);
    });
});

gulp.task('delete-build-folder', function () {
    deleteFolderRecursive('build');
});

gulp.task('copy-files-to-tapestry-app', function () {
    if(gulpConfig.tapestryFolder) {
        console.log(hintLog('-------------------------------------------------- COPYING TO TAPESTRY APP...'));
        deleteFolderRecursive(gulpConfig.tapestryFolder);
        // copy the build folder to the tapestry app
        setTimeout(function () {
            ncp('build', gulpConfig.tapestryFolder, function (err) {
                if (err) return console.error(err);
                console.log(hintLog('-------------------------------------------------- COPYING DONE!'));
            });
        }, 12000);
    }
});

/**
 * Delete build folder, copy, minify, annotate and hash everything, then copy it to the tapestry app
 */

gulp.task('build:prod', function () {
    console.log(hintLog('-------------------------------------------------- BUILD - Full Production Mode'));
    isProduction = true;
    runSequence('delete-build-folder', 'copy', 'concat', 'hash', 'copy-files-to-tapestry-app');
});

/**
 * Builds the version without hash and delete-build-folder (linux only)
 */
gulp.task('build:windows', function () {
    console.log(hintLog('-------------------------------------------------- BUILD - Windows Mode'));
    isProduction = true;
    runSequence('copy', 'concat', 'copy-files-to-tapestry-app');
});

gulp.task('build:only', function () {
    console.log(hintLog('-------------------------------------------------- BUILD - Windows Mode'));
    isProduction = true;
    runSequence('copy', 'concat');
});


/**
 * Builds the app in default mode
 */
gulp.task('build', function () {
    console.log(hintLog('-------------------------------------------------- BUILD - Development Mode'));
    runSequence('copy', 'concat', 'watch');
});

/**
 * Run the minified site in production mode without hashing anything and copying to the tapestry app
 */
gulp.task('run:prod', function () {
    console.log(hintLog('-------------------------------------------------- RUN - Full Production Mode'));
    isProduction = true;
    runSequence('copy', 'concat', 'watch', 'server');
});

/**
 * Builds the app and runs the server without minifying or copying anything
 */

gulp.task('default', ['build', 'server']);


/*============================================================
 =                       Browser Sync                         =
 ============================================================*/

gulp.task('bs', function () {
    browserSync.init([SETTINGS.build.app + 'index.html', SETTINGS.build + 'templates/*.html', SETTINGS.build.css + '*css', SETTINGS.build.js + '*.js'], {
        proxy: {
            host: '127.0.0.1',
            port: serverConfig.port
        }
    });
});
