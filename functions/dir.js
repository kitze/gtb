module.exports = function (config) {
  return function (folder){
    return config.prefix + config.src.app + folder + "/";
  }
};