var historyApiFallback = require('connect-history-api-fallback'),
    gulpConfig         = require('../functions/gulp-config')();

module.exports = {
  'host': 'localhost',
  'livereload': gulpConfig.liveReload,  // Tip: disable livereload if you're using older versions of internet explorer because it doesn't work
  'middleware': function () {
    return [historyApiFallback];
  },
  port: gulpConfig.serverPort
};