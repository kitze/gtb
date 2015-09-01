var runSequence = require('run-sequence');

module.exports = function () {
  return function () {
    // Make sure all the files are processed before running the server and the watch
    runSequence('process', function () {
      runSequence('server', 'watch')
    });
  }
};