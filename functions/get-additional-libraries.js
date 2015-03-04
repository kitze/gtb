module.exports = function (gulp, plugins, config) {
  return function getAdditionalLibraries(obj) {
    var libs = [];
    _.each(obj, function (library) {
      _.each(library.files, function (file) {
        if (config.isProduction === false && config.gulp.ignore !== true || config.gulp.ignoredFiles.js.indexOf(library.name) === -1) {
          libs.push(config.dirs.src.bower + library.name + "/" + file);
        }
        else {
          console.log(library.name + " ignored");
        }
      });
    });
    return libs;
  }
};