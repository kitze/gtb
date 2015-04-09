module.exports = function (gulp, plugins, config) {
  var _ = require('underscore');

  return function (obj, libType) {
    var libs = [];
    var libsToSearch = libType === "sass" ? obj.sass.concat(obj.js) : (obj[libType]);
    _.each(libsToSearch, function (library) {
      if (libType === "sass") {
        libs.push(global.prefix + config.dirs.bower + "/" + library.name);
      }
      else {
        _.each(library.files, function (file) {
          if (global.isProduction === false && config.gulp.ignore !== true || config.gulp.ignoredFiles[libType].indexOf(library.name) === -1) {
            libs.push(global.prefix + config.dirs.bower + "/" + library.name + "/" + file);
          }
          else {
            console.log(library.name + "is ignored");
          }
        });
      }
    });
    return libs;
  }
};