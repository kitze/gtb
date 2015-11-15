var gulp = require('gulp'),
    _    = require('lodash');

module.exports = {

  load: function () {

    var directories = require('../config/directories-config');
    var files = require('../config/files-config');
    var plugins = require('gulp-load-plugins')({config: files.PACKAGE_JSON});

    /* Each of the gulp tasks that are in a separate file needs access to "gulp" and "plugins",
     * so when a task is required
     * those 3 variables are supplied as arguments
     * */

    function addTask(taskName, taskPath) {
      gulp.task(taskName, require(files.GULP_TASKS + (taskPath ? taskPath : taskName))(gulp, plugins));
    }

    function addTaskFolder(folder, tasksArray) {
      _.each(tasksArray, function (taskName) {
        addTask(folder + ':' + taskName, folder + "/" + folder + "-" + taskName);
      });
    }

    /*  ================== Add tasks from folders ================== */

    addTaskFolder('process', ['html', 'css', 'js', 'bower', 'fonts', 'images']);
    addTaskFolder('clean', ['build', 'rev']);
    addTaskFolder('build', ['only', 'serve']);
    addTaskFolder('copy', ['build', 'other']);
    addTaskFolder('deploy', ['surge']);

    /*  ================== Tasks ================== */

    // Run server that will serve index.html and the assets
    addTask('server');

    // Watch the directories for changes and reload the page, or if a scss/css file is changed inject it automatically without refreshing
    addTask('watch');

    // Replaces filenames in index.html with the new ones that the rev task produced
    addTask('replace-rev');

    // Processes bower files, js, css, fonts, images, html
    addTask('process');

    // Builds the app and runs the server
    addTask('default');

  }

};
