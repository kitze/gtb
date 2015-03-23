module.exports = function (gulp, plugins, config) {
  var _ = require('underscore');
  var dir = require('../functions/dir')(config);

  return function(obj) {
    var libs = [];
    _.each(obj, function (library) {
      _.each(library.files, function (file) {
        if (global.isProduction === false && config.gulp.ignore !== true || config.gulp.ignoredFiles.js.indexOf(library.name) === -1) {
          libs.push(config.dirs.prefix+config.dirs.bower + "/" + library.name + "/" + file);
        }
        else {
          console.log(library.name + " ignored");
        }
      });
    });
    return libs;
  }
};