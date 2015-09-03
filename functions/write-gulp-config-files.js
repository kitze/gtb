var fs                = require('fs'),
    jsonFile          = require('jsonfile'),
    _                 = require('underscore'),
    readFile          = jsonFile.readFileSync,
    writeFile         = jsonFile.writeFileSync,
    fileExists        = fs.existsSync,
    files             = require('../config/files-config'),
    gtbConfigTemplate = require('../config/gtb-config-template');

module.exports = function () {

  function updateAndWriteConfig(configFilePath) {

    var newConfig = {};

    // if config file doesn't exist, write a new file with the default gtb template settings
    if (!fileExists(configFilePath)) {
      writeFile(configFilePath, gtbConfigTemplate, {spaces: 2});
      return;
    }

    //if config file exists, check if some properties don't exist in the gtb default template anymore and remove them
    var configItems = readFile(configFilePath);

    _.each(configItems, function (prop, key) {
      if (gtbConfigTemplate[key] !== undefined) {
        newConfig[key] = prop;
      }
    });

    // save the new config file
    writeFile(configFilePath, _.extend(gtbConfigTemplate, newConfig), {spaces: 2});
  }

  // If a gtb config doesn't exist for the project generate one that will be global for the project
  updateAndWriteConfig(files.GULP_CONFIG);
  // If a custom gtb config doesn't exist generate one so every user can have custom settings locally
  updateAndWriteConfig(files.CUSTOM_CONFIG);

};