var gulp                 = require('gulp'),
    fs                   = require('fs'),
    os                   = require('os'),
    _                    = require('underscore'),
    args                 = require('yargs').argv,
    runSequence          = require('run-sequence'),
    plugins              = require('gulp-load-plugins')({config: '../../package.json'}),
    bdir                 = require('../functions/build-dir'),
    con                  = require('../functions/console'),
    fixGitIgnore         = require('../functions/fix-git-ignore'),
    writeGulpConfigFiles = require('../functions/write-gulp-config-files'),
    files                = require('../config/files-config'),
    directories          = require('../config/directories-config');

module.exports = function () {

  // Write gulp config files 
  writeGulpConfigFiles();

  // Fix .gitignore
  fixGitIgnore();

  var tasksConfig = {
    gulp: require('../functions/gulp-config')(),
    dirs: directories,
    args: args
  };

  /* Each of the gulp tasks that are in a separate file needs access to
   * the variables "gulp", "plugins" and "tasksConfig", so when a task is required
   * those 3 variables are supplied as arguments
   * */

  function addTask(folder, task, runBeforeTask) {
    var taskName = task ? (folder + ':' + task) : folder;
    var taskFolder = '/' + folder + (task ? '/' : '') + (task ? (folder + '-' + task) : (task ? folder : ''));
    gulp.task(taskName, runBeforeTask ? runBeforeTask : [], require('../tasks' + '/' + taskFolder)(gulp, plugins, tasksConfig));
  }

  function addTaskCombination(name, tasks, cb) {
    gulp.task(name, function () {
      runSequence(getTaskGroup(name, tasks), cb);
    });
  }

  function getTaskGroup(name, arr) {
    return _(arr).map(function (m) {
      return name + ':' + m
    });
  }

  // Clean 
  addTask('clean', 'build');
  addTask('clean', 'zip');

  // Process 
  addTask('process', 'html');
  addTask('process', 'css');
  addTask('process', 'js');
  addTask('process', 'bower');
  addTask('process', 'fonts');
  addTask('process', 'images');

  addTask('rev');

  addTaskCombination('process', ['html', 'css', 'js', 'bower', 'fonts', 'images'], function () {
    // after everything is done run rev to add revision numbers to the files 
    if (global.isProduction === true) {
      runSequence('rev', 'cleanup');
    }
  });

  // Cleans up folders & files that are not needed after run/build 
  addTask('cleanup');

  // Copies build folder to the directory defined in the "copyToFolder" property in gulp-config.json 
  addTask('copy', 'build');

  // Copies json directory to build directory 
  addTask('copy', 'json');

  // Run server that will serve index.html and the assets 
  addTask('server');

  // Build the app and put the 'build' folder in a zip file 
  addTask('zip');

  // Watch the directories for changes and reload the page, or if a scss/css file is changed inject it automatically without refreshing 
  addTask('watch');

  // Delete build folder, copy, minify, annotate everything, then copy it to the destination folder 
  addTask('build', 'copy');

  // Just build the project in production mode, don't run anything else 
  addTask('build', 'only');

  // Just serve the project in production mode
  addTask('build', 'serve');

  // Just build the project in normal non-production mode, don't run anything else 
  addTask('build', 'normal');

  // Run the built & minified site in production mode without hashing anything and copying to the destination folder 
  addTask('build', 'prod');

  // Default task: Builds the app and runs the server without minifying or copying anything to a destination 
  gulp.task('default', function () {
    runSequence(['process', 'server', 'watch'])
  });
};
