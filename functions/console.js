var chalk = require('chalk');
var moment = require('moment');

function timestamp() {
  return "[" + chalk.gray(new moment().format("HH:mm:ss")) + "]";
}

var log = function (toLog) {
  [].unshift.call(arguments, timestamp());
  console.log.apply(this, arguments);
};

module.exports = {
  log: log,
  err: function () {
    log(chalk.red.bold.apply(this, arguments));
  },
  hint: function () {
    log(chalk.green.bold.apply(this, arguments));
  },
  custom: function () {
    this.log.apply(this, arguments);
  },
  errorWithSpaces: function (text) {
    console.log('\n');
    this.err(text);
    console.log('\n');
  }
};