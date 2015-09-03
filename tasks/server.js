module.exports = function () {
  var browserSync = require('../classes/browser-sync'),
      con         = require('../functions/console');

  con.hint('Starting server');

  return function () {
    browserSync.init();
  }
};