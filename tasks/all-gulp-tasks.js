var gulp                 = require('gulp'),
    _                    = require('underscore'),
    args                 = require('yargs').argv,
    bdir                 = require('../functions/build-dir'),
    con                  = require('../functions/console'),
    fixGitIgnore         = require('../functions/fix-git-ignore'),
    writeGulpConfigFiles = require('../functions/write-gulp-config-files'),
    files                = require('../config/files-config'),
    plugins              = require('gulp-load-plugins')({config: files.PACKAGE_JSON}),
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

  function addTask(taskName, taskPath) {
    gulp.task(taskName, require(files.GULP_TASKS + (taskPath ? taskPath : taskName))(gulp, plugins, tasksConfig));
  }

  function addTaskFolder(folder, tasksArray) {
    _.each(tasksArray, function (taskName) {
      addTask(folder + ':' + taskName, folder + "/" + folder + "-" + taskName);
    });
  }

  /*  ================== Add tasks from folders ================== */

  addTaskFolder('process', ['html', 'css', 'js', 'bower', 'fonts', 'images']);
  addTaskFolder('clean', ['build', 'zip', 'rev']);
  addTaskFolder('build', ['only', 'serve']);
  addTaskFolder('copy', ['build', 'json']);

  /*  ================== Tasks ================== */

  // Run server that will serve index.html and the assets 
  addTask('server');

  // Build the app and put the 'build' folder in a zip file 
  addTask('zip');

  // Watch the directories for changes and reload the page, or if a scss/css file is changed inject it automatically without refreshing 
  addTask('watch');

  // Replaces filenames in index.html with the new ones that the rev task produced
  addTask('replace-rev');

  // Processes bower files, js, css, fonts, images, html
  addTask('process');

  // Builds the app and runs the server
  addTask('default');

};
