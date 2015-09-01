module.exports = function (gulp, plugins, config) {
  var fileDir = require('../functions/file-dir')(config);
  var dir = require('../functions/dir')(config);
  var notifier = require('gulp-notify/node_modules/node-notifier');
  var watchedFiles = [];
  var con = require('../functions/console');
  var chalk = require('chalk');

  return function () {

    con.hint('Watching files for changes ...');
    watchedFiles.push(gulp.watch(fileDir(["coffee", "js"], "js"), ['process:js']));
    watchedFiles.push(gulp.watch(fileDir(["html", "jade"], "root"), ['process:html']));
    watchedFiles.push(gulp.watch(fileDir(["scss", "sass", "css"], "css"), ['process:css']));

    watchedFiles.forEach(function (watchedFile) {
      watchedFile.on('change', function (event) {
        con.custom(chalk.green.bold(event.type + ": ") + event.path.replace(dir(''), ''));
      });
    });

    /*
     var bowerFileDirectory = global.prefix + "bower.json";
     gulp.watch(bowerFileDirectory)
     .on('change', function (event) {
     if (event.type === "changed") {
     con.custom(chalk.green.bold('bower.json changed:') + ' executing bower prune & install');
     exec("( cd " + global.prefix + "; bower prune; bower install )");
     notifier.notify({
     "title": "bower.json changed!",
     'message': "Bower components were updated accordingly."
     });
     setTimeout(function() {
     gulp.start('process:bower');
     }, 500);
     }
     }
     );*/
  }
};