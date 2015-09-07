module.exports = function () {

  var fs = require('fs');
  var del = require('del');
  var getDir = require('../../functions/get-dir');
  var con = require('../../functions/console');

  return function () {
    con.hint('Cleaning up...');
    var revFolder = getDir.build('rev');
    del(revFolder, {
      force: true
    });
  }
};