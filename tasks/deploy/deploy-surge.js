var shell       = require('shelljs/global'),
    runSequence = require('run-sequence'),
    con         = require('../../functions/console'),
    getDir      = require('../../functions/get-dir');

module.exports = function () {

  function deployToSurge() {
    con.hint('Deploying to surge...');

    if (!which('surge')) {
      con.err('You don\'t have surge installed on your machine. Run `npm install -g surge` to install it.');
      exit(1);
      return;
    }

    if (exec('surge ' + getDir.build('')).code !== 0) {
      con.err('Error: Deploying to surge failed!');
      exit(1);
    }
  }

  return function () {
    global.isProduction = true;
    runSequence('copy:other', 'process', function () {
      deployToSurge();
    });
  }

};