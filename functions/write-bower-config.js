var fs         = require('fs'),
    jsonFile   = require('jsonfile'),
    _          = require('lodash'),
    readFile   = jsonFile.readFileSync,
    writeFile  = jsonFile.writeFileSync,
    fileExists = fs.existsSync,
    gulpConfig = require('../functions/gulp-config'),
    files      = require('../config/files-config');

module.exports = function () {
  var bowerConfig = {
    directory: gulpConfig.projectConfig.directories.bower
  };

  var bowerrcPath = global.prefix + files.BOWERRC;

  if (fileExists(bowerrcPath)) {
    bowerConfig = _.extend(readFile(bowerrcPath), bowerConfig);
  }

  writeFile(bowerrcPath, bowerConfig, {spaces: 2});
};