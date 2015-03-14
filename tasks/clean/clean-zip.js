module.exports = function (gulp, plugins, config) {
  var cleanFiles = require('../../functions/clean-files');
  return function (){
    cleanFiles([config.dirs.prefix+'zip/**/*', config.dirs.prefix+'!zip/build-*.zip'], 'zip');
  }
};