var projectConfig = require('../functions/gulp-config').projectConfig;
var filesConfig = require('../config/files-config');

module.exports = [
  projectConfig.directories.build + '/',
  projectConfig.directories.bower + '/',
  filesConfig.CUSTOM_CONFIG,
  '.idea/',
  '.DS_STORE',
  'npm-debug.log'
];