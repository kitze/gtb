module.exports = function (gulp, plugins, config) {
  var fileDir = require('../functions/file-dir')(config);
  var runSequence = require('run-sequence');
  var watchedFiles = [];

  function addWatcher(task, type, directory) {
    watchedFiles.push(gulp.watch(fileDir(type, directory), [task]));
  }

  var watchers = {
    concat: function (type, directory) {
      addWatcher('concat:' + type, type, directory);
    },
    copy: function (type, directory) {
      addWatcher('copy:' + type, type, directory)
    },
    copyAll: function (type, directory) {
      addWatcher('copy:' + type, '*', type, directory)
    },
    custom: function (task, type, directory) {
      addWatcher(task, type, directory)
    }
  };

  return function (watch) {
    console.log('watching all the files.....');
    watchers.concat('css');
    watchers.concat('js');
    watchers.copyAll('images');
    watchers.copyAll('fonts');
    watchers.copy('json');
    watchers.copy('html', 'templates');
    watchers.custom('copy:htmlroot', 'html', 'root');
    watchers.custom('concat:bower', 'js', 'bower');
    watchedFiles.push(gulp.watch(fileDir(['scss', 'sass'], 'css'), ['concat:css']));
    watchedFiles.push(gulp.watch(fileDir('jade', ['app', 'templates']), ['compile:jade']));
    watchedFiles.push(gulp.watch(fileDir('coffee', 'js'), ['compile:coffee']));

    var onChange = function (event) {
      if (event.type === 'deleted') {
        runSequence('clean');
        setTimeout(function () {
          runSequence('copy', 'concat', 'watch');
        }, 500);
      }
      console.log('-------------------------------------------------->>>> File ' + event.path + ' was ------->>>> ' + event.type);
    };

    watchedFiles.forEach(function (watchedFile) {
      watchedFile.on('change', onChange);
    });
  }
};