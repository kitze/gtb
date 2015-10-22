module.exports = function () {
  var browserSync = require('../classes/browser-sync'),
      con         = require('../functions/console'),
      notifier    = require('node-notifier');

  return function () {
    con.hint('Starting server...');

    notifier.notify({
      'title': 'Server',
      'message': 'Server has started.'
    });
    browserSync.init();
  }
};