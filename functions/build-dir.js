module.exports = function (config) {
  return function (folder){
    var s = config.dirs.prefix + config.dirs.build + "/" + folder;
    console.log(s);
    return s;
  }
};