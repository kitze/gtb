var runSequence = require('run-sequence');

module.exports = function (gulp, plugins, config) {
  return function (){
    global.isProduction = true;
    runSequence(
      'copy',
      'concat',
      'server',
      'watch'
    );
  }
};