var browserSync  = require('browser-sync'),
    serverConfig = require('../config/server-config');

BrowserSync = module.exports = {
  server: browserSync,
  init: function () {
    BrowserSync.server = browserSync.create();
    BrowserSync.server.init(serverConfig());
  }
};
