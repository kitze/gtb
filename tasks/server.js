module.exports = function (gulp, plugins, config) {
  var open = require('open');
  return function () {
    plugins.connect.server(config.server);
    if (config.gulp.openAfterLaunch) {
      open('http://localhost:' + config.server.port);
    }
  }
};