module.exports = function () {
  var directories = require('../config/directories-config');

  return function (folder){
    return global.prefix + directories.app + "/" + folder;
  }
};