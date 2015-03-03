module.exports = function (gulp, plugins, config) {
  var deleteFolderRecursive = require('../functions/delete-folder-recursive');
  var ncp = require('ncp');
  return function () {
    if (config.gulp.tapestryFolder) {
      deleteFolderRecursive(config.gulp.tapestryFolder);
      //console.log('copying to tapestry folder');
      setTimeout(function () {
        ncp('build', config.gulp.tapestryFolder, function (err) {
          if (err) return console.error(err);
          //console.log('done copying to tapestry');
        });
      }, 12000);
    }
  }
};