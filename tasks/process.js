var runSequence = require('run-sequence');

module.exports = function () {
  return function (callback) {
    return runSequence(
      'clean:build',
      ['process:bower', 'process:js', 'process:css'],
      ['process:fonts', 'process:images', 'process:html'],
      function () {
        if (global.isProduction) {
          runSequence('replace-rev', 'clean:rev', 'copy:other', function () {
            callback();
          });
          return;
        }
        runSequence('copy:other', function () {
          callback();
        });
      });
  }
};