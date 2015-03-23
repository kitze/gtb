module.exports = function (gulp, plugins, config) {
  return function () {
    plugins.connect.server(config.server);
    if (config.gulp.openAfterLaunch) {
      open('http://localhost:' + config.server.port);
    }
  }
};