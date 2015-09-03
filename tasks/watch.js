var runSequence = require('run-sequence');
var browserSync = require('../classes/browser-sync');

module.exports = function (gulp, plugins, config) {
  var fileDir = require('../functions/file-dir')(config);
  var dir = require('../functions/dir')(config);
  var notifier = require('gulp-notify/node_modules/node-notifier');
  var con = require('../functions/console');


  function watcher(fileTypes, directory, process) {
    plugins.watch(fileDir(fileTypes, directory), function () {
      con.hint(process + " file changed ... ");
      runSequence('process:' + process, function () {
        if(process!=='css') { //for css the file is streamed directly to the browser
          browserSync.server.reload();
        }
      });
    });
  }

  return function () {
    con.hint('Watching files for changes ...');

    watcher(['html', 'jade'], 'root', 'html');
    watcher(['scss', 'sass', 'css'], 'css', 'css');
    watcher(['coffee', 'js'], 'js', 'js');
  }
};