var runSequence = require('run-sequence');
var con = require('../../functions/console');

module.exports = function () {
  return function () {
    con.hint('Building project...');
    global.isProduction = true;
    runSequence(
      'process', function(){
        runSequence('server');
      }
    );
  }
};