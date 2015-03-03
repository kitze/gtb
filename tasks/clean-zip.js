module.exports = function () {
  var cleanFiles = require('../functions/clean-files');
  return function (){
    cleanFiles(['zip/**/*', '!zip/build-*.zip'], 'zip');
  }
};