module.exports = function (gulp, plugins, config) {
  var ncp = require('ncp');
  var del = require('del');
  var bdir = require('../../functions/build-dir')(config);

  return function () {
    if (config.gulp.copyToFolder) {
      del.sync(config.gulp.copyToFolder);
      ncp(bdir(''), config.gulp.copyToFolder, function (err) {
        if (err) {
          return console.error(err);
        }
      });
    }
  }
};