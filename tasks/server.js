var open         = require('open'),
    _            = require('underscore'),
    serverConfig = require('../config/server-config');

module.exports = function (gulp, plugins, config) {

  return function () {

    plugins.connect.server(_(serverConfig).extend({
      "root": global.prefix + config.dirs.build
    }));

    if (config.gulp.openAfterLaunch) {
      open('http://localhost:' + serverConfig.port);
    }
  }
};