module.exports = function (gulp, plugins, config) {
  var cleanFiles = require('../functions/clean-files');
  cleanFiles();
  return function (){
    cleanFiles([config.dirs.build.app], 'all files');
  }
};