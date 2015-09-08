module.exports = function () {
  var getDir = require('../../functions/get-dir');
  var del = require('del');

  return function () {
    return del.sync(getDir.build(), {force: true});
  }
};