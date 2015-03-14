module.exports = function (gulp, plugins, config) {
  var cleanFiles = require('../../functions/clean-files');
  var dir = require('../../functions/dir')(config);
  return function () {
    cleanFiles([dir(config.dirs.build)], 'all files');
  }
};