module.exports = function (gulp, plugins, config) {
  var bdir = require('../../functions/build-dir')(config);
  var del = require('del');

  return function () {
    return del.sync(bdir(''), {force: true}, function () {
      console.log('del is done');
    });
  }
};