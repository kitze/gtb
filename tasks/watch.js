module.exports = function (gulp, plugins, config) {
  var fileDir = require('../functions/file-dir')(config);
  var dir = require('../functions/dir')(config);
  var runSequence = require('run-sequence');
  var notifier = require('gulp-notify/node_modules/node-notifier');
  var watchedFiles = [];
  var con = require('../functions/console');
  var chalk = require('chalk');

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

  function waitAndClean() {
    runSequence('clean:build');
    setTimeout(function () {
      runSequence('compile:jade', 'copy', 'concat', 'watch');
    }, 500);
  }

  return function () {
    watchers.concat('js');
    watchers.copyAll('images');
    watchers.copyAll('fonts');
    watchers.copy('json');
    watchers.copy('html', 'templates');
    watchers.custom('copy:htmlroot', 'html', 'root');
    watchers.custom('concat:bower', 'js', 'bower');
    watchedFiles.push(gulp.watch(fileDir(['scss', 'sass'], 'css').concat(fileDir(['css'])), ['compile:sass']));
    watchedFiles.push(gulp.watch(fileDir('jade', ['', 'templates']), ['compile:jade']));
    watchedFiles.push(gulp.watch(fileDir('coffee', 'js'), ['compile:coffee']));

    /* If each of the files is deleted, delete the build directory and run tasks again */
    var onChange = function (event) {
      con.custom(chalk.green.bold(event.type + ": ") + event.path.replace(dir(''), ''));
      if (event.type === 'deleted') {
        waitAndClean();
      }
    };

    watchedFiles.forEach(function (watchedFile) {
      watchedFile.on('change', onChange);
    });

    var bowerFileDirectory = global.prefix + "bower.json";
    gulp.watch(bowerFileDirectory)
      .on('change', function (event) {
        if (event.type === "changed") {
          console.log('-------->>>>  bower.json changed, executing bower prune & install!');
          exec("( cd " + global.prefix + "; bower prune; bower install )");
          runSequence('copy', 'concat', 'watch');
          notifier.notify({
            "title": "bower.json changed!",
            'message': "Bower components were updated accordingly."
          });
        }
      }
    )
    ;
  }
}
;