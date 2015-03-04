var chalk = require('chalk');
var log = function (a, b) {
  if (b) {
    console.log(a, b);
    return;
  }
  console.log(a);
};
module.exports = {
  log: log,
  err: function (a, b) {
    log(chalk.red.bold(a), b)
  },
  hint: function (a, b) {
    log(chalk.blue.bold(a), b);
  }
};