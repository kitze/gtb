var gulp        = require('gulp'),
    bowerFiles  = require('main-bower-files'),
    path        = require('path'),
    fs          = require('fs'),
    chalk       = require('chalk'),
    _           = require('underscore'),
    args        = require('yargs').argv,
    map         = require('map-stream'),
    runSequence = require('run-sequence'),
    plugins     = require('gulp-load-plugins')(),
    con = require('./functions/console');

con.err('strasno');
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
 =>                 Load all gulp tasks
 ============================================================*/

var gulpTasksFolder = './tasks';
var config = function () {
  return {
    server: serverConfig,
    gulp: gulpConfig,
    dirs: SETTINGS,
    isProduction: isProduction,
    replacements:replacements,
    bower:bowerConfig
  };
};

function getTask(task) {
  return require(gulpTasksFolder + "/" + task)(gulp, plugins, config());
}

function addTask(folder,task){
  var taskName = task?(folder+":"+task):folder;
  var taskFolder = "/"+folder+"/"+(task?(folder+"-"+task):folder);
  gulp.task(taskName, getTask(taskFolder));
}

function addTaskCombination(name,arr){
  gulp.task(name, _(arr).map(function(m){return name+":"+m}))
}

/* ================================= Task List ============================================== */

/* Clean */
addTask('clean');
addTask('clean', 'build');
addTask('clean', 'zip');

/* Compile */
addTask('compile','coffee');
addTask('compile','jade');
addTask('compile','sass');

/* Concat */

gulp.task('concat:css', ['compile:sass'], getTask('/concat/concat-css'));
addTask('concat','js');
addTask('concat','bower');
addTaskCombination('concat','bower','js','css','fonts');

/* Copy */

addTask('copy','build');
addTask('copy','custom');
addTask('copy','font');
addTask('copy','fonts');
addTask('copy','html');
addTask('copy','html-root');
addTask('copy','images');
addTask('copy','json');
addTaskCombination('copy',['html','custom','images', 'json', 'fonts', 'font', 'html:root']);

/* Other */

gulp.task('server', getTask('server'));
gulp.task('image:min', getTask('image-min'));
gulp.task('zip', getTask('zip'));
gulp.task('hash', getTask('hash'));
gulp.task('watch', getTask('watch'));
gulp.task('tasks', plugins.taskListing);

/* ================================================================================= */

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
