var notifier = require('node-notifier');
var con = require('../functions/console');
var chalk = require('chalk');

module.exports = function (err) {
  var file = err.file || err.filename || err.path;

  // show a system notification when there's an error in a sass file
  notifier.notify({
    'title': 'Error',
    'message': err.message + " at " + file
  });

  con.custom(chalk.red.bold('Error: ') + err.message);

  if (file !== undefined) {
    con.custom(chalk.red.bold('File: ') + file);
  }

  if (err.line !== undefined && err.column !== undefined) {
    con.custom(chalk.red.bold('Position: ') + 'Line:' + err.line + ' Column:' + err.column);
  }

};