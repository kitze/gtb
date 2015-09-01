var fs                = require('fs'),
    jsonFile          = require('jsonfile'),
    _                 = require('underscore'),
    writeFile         = jsonFile.writeFileSync,
    fileExists        = fs.existsSync,
    files             = require('../config/files-config'),
    gtbConfigTemplate = require('../config/gtb-config-template');

module.exports = function () {
  // If a gtb config doesn't exist for the project generate one that will be global for the project
  if (!fileExists(files.GULP_CONFIG)) {
    writeFile(files.GULP_CONFIG, gtbConfigTemplate, {spaces: 2});
  }

  // If a custom gtb config doesn't exist generate one so every user can have custom settings locally
  if (!fileExists(files.CUSTOM_CONFIG)) {
    writeFile(files.CUSTOM_CONFIG, _(gtbConfigTemplate).omit(
      [
        'imagesFolder',
        'copyToFolder'
      ]
    ), {spaces: 2});
  }

};