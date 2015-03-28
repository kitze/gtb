var runSequence = require('run-sequence');
module.exports = function () {
  return function () {
    global.isProduction = true;
    runSequence(
      'copy',
      'concat'
    );
  }
};