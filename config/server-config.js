var historyApiFallback = require('connect-history-api-fallback'),
    directories        = require('../config/directories-config'),
    _                  = require('lodash');

module.exports = function () {

  var gulpConfig = require('../functions/gulp-config').userConfig;

  var serverConfig = {
    server: {
      baseDir: global.prefix + directories.build,
      middleware: [historyApiFallback()]
    },
    ui: false,
    notify: false,
    port: gulpConfig.server.port,
    ghostMode: {
      clicks: gulpConfig.server.syncClicks,
      forms: gulpConfig.server.syncForms,
      scroll: gulpConfig.server.syncScroll
    },
    open: false
  };

  if (gulpConfig.server.openAfterLaunch === true) {
    serverConfig = _.extend(serverConfig, {
      open: gulpConfig.server.openAfterLaunch,
      browser: gulpConfig.server.openInBrowsers
    });
  }

  return serverConfig;
};