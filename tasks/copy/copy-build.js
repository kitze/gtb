module.exports = function (gulp, plugins, config) {
  var ncp = require('ncp');
  var del = require('del');
  var path = require('path');
  var getDir = require('../../functions/get-dir');

  // Copies build folder to the directory defined in the "copyToFolder" property in gulp-config.json

  return function () {
    if (config.gulp.copyToFolder) {
      var copyPath = path.join(global.prefix + config.gulp.copyToFolder);
      del.sync(copyPath, {force: true});
      ncp(getDir.build(''), copyPath, function (err) {
        if (err) {
          return console.error(err);
        }
      });
    }
  }
};