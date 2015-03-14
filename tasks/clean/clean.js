module.exports = function (gulp, plugins, config) {
  var cleanFiles = require('../../functions/clean-files');
  return function (){
    cleanFiles([config.dirs.prefix+config.dirs.build.app], 'all files');
  }
};