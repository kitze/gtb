module.exports = function (gulp, plugins, config) {
  var open = require('open');
  var _ = require('underscore');
  var figlet = require('figlet');

  return function () {
    plugins.connect.server(_(config.server).extend({
      "root": global.prefix + config.dirs.build
    }));

    if (config.gulp.openAfterLaunch) {
      open('http://localhost:' + config.server.port);
    }
  }
};