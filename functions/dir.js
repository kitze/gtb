module.exports = function (config) {
  return function (folder){
    return config.dirs.prefix + config.dirs.app + "/" + folder;
  }
};