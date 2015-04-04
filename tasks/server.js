module.exports = function (gulp, plugins, config) {
  var open = require('open');
  var _ = require('underscore');
  var figlet = require('figlet');

  return function () {
    plugins.connect.server(_(config.server).extend({
      "root": global.prefix + config.dirs.build
    }));

    figlet('GTB', function(err, data) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(data)
    });

    if (config.gulp.openAfterLaunch) {
      open('http://localhost:' + config.server.port);
    }
  }
};