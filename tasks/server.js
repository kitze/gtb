module.exports = function (gulp, plugins, config) {
  return function () {
    plugins.connect.server(config.server);
    console.log('Started connect web server on http://localhost:' + config.server.port + '.');
    if (config.gulp.openAfterLaunch) {
      open('http://localhost:' + config.server.port);
    }
  }
};