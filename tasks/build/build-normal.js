var runSequence = require('run-sequence');
module.exports = function () {
  return function () {
    global.isProduction = false;
    runSequence(
      'copy',
      'concat'
    );
  }
};