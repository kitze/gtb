module.exports = function (gulp, plugins, config) {
  var bdir = require('../../functions/build-dir')(config);
  var del = require('del');
  return function () {
    del.sync(bdir(''));
  }
};