module.exports = function (config) {
  return function (folder){
    return global.prefix + config.dirs.app + "/" + folder;
  }
};