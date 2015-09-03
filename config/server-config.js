var historyApiFallback = require('connect-history-api-fallback'),
    directories        = require('../config/directories-config'),
    gulpConfig         = require('../functions/gulp-config')(),
    _                  = require('underscore');

module.exports = function () {

  var serverConfig = {
    server: {
      baseDir: global.prefix + directories.build,
      middleware: [historyApiFallback()]
    },
    ui: false,
    notify: false,
    port: gulpConfig.serverPort,
    ghostMode: {
      clicks: gulpConfig.syncClicks,
      forms: gulpConfig.syncForms,
      scroll: gulpConfig.syncScroll
    },
    open: false
  };

  if (gulpConfig.openAfterLaunch === true) {
    serverConfig = _.extend(serverConfig, {
      open: gulpConfig.openAfterLaunch,
      browser: gulpConfig.openInBrowsers
    });
  }

  return serverConfig;
};