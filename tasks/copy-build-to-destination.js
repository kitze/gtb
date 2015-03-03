module.exports = function (gulp, plugins, config) {
  var deleteFolderRecursive = require('../functions/delete-folder-recursive');
  var ncp = require('ncp');
  return function () {
    if (config.gulp.copyToFolder) {
      deleteFolderRecursive(config.gulp.copyToFolder);
      //console.log('copying to destination folder');
      setTimeout(function () {
        ncp('build', config.gulp.copyToFolder, function (err) {
          if (err) return console.error(err);
          //console.log('done copying to destination folder');
        });
      }, 12000);
    }
  }
};