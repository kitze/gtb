module.exports = function (gulp, plugins, config) {

  var _ = require('lodash');
  var directories = require('../config/directories-config');

  return function (obj, libType) {
    var libs = [];
    var libsToSearch = libType === "sass" ? obj.sass.concat(obj.js) : (obj[libType]);
    _.each(libsToSearch, function (library) {
      if (libType === "sass") {
        libs.push(global.prefix + directories.bower + "/" + library.name);
      }
      else {
        _.each(library.files, function (file) {
          var ignoredProperty = config.gulp.ignoredFiles[libType];
          if (global.isProduction === false && config.gulp.ignore !== true || (ignoredProperty === undefined || ignoredProperty.indexOf(library.name) === -1)) {
            libs.push(global.prefix + directories.bower + "/" + library.name + "/" + file);
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