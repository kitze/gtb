var chalk = require('chalk');
var moment = require('moment');

function timestamp(){
  return "[" + chalk.gray.bold(new moment().format("HH:mm:ss")) + "] ";
}

var log = function (toLog) {
  console.log(timestamp() + arguments[0]);
};

module.exports = {
  log: log,
  err: function () {
    log.apply(chalk.red.bold.apply(this, arguments))
  },
  hint: function () {
    log(chalk.green.bold.apply(this, arguments));
  }
};