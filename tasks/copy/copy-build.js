module.exports = function (gulp, plugins, config) {
  var ncp = require('ncp');
  var del = require('del');
  var path = require('path');
  var bdir = require('../../functions/build-dir')(config);
  var dir = require('../../functions/dir')(config);

  return function () {
    if (config.gulp.copyToFolder) {
      var copyPath = path.join(global.prefix + config.gulp.copyToFolder);
      del.sync(copyPath, {force:true});
      ncp(bdir(''), copyPath, function (err) {
        if (err) {
          return console.error(err);
        }
      });
    }
  }
};