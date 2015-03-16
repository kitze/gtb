module.exports = function (config) {
  return function (folder){
    return config.dirs.prefix + config.dirs.build + "/" + folder;
  }
};