module.exports = function (config) {
  console.log('prefix is', config.dirs===undefined);
  return function (folder){
    console.log('folder',folder);
    var s = config.dirs.prefix + config.dirs.app + "/" + folder;
    console.log('s',s);
    return s;
  }
};