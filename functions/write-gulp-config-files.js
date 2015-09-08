var fs                       = require('fs'),
    jsonFile                 = require('jsonfile'),
    _                        = require('underscore'),
    readFile                 = jsonFile.readFileSync,
    writeFile                = jsonFile.writeFileSync,
    fileExists               = fs.existsSync,
    gtbProjectConfigTemplate = require('../config/gtb-project-config-template'),
    gtbUserConfigTemplate    = require('../config/gtb-user-config-template'),
    gulpConfig               = require('../functions/gulp-config'),
    files                    = require('../config/files-config');

module.exports = function () {

  function checkConfigItems(configItems, templateItems) {
    var newConfig = {};
    _.each(configItems, function (prop, key) {
      // if config property is an object call the function recursive
      if (_.isObject(prop) && !_.isArray(prop)) {
        newConfig[key] = checkConfigItems(prop, templateItems[key]);
        return;
      }
      // write the property only if it exists in the current config template
      if (templateItems[key] !== undefined) {
        newConfig[key] = prop;
      }
    });

    return _.extend(templateItems, newConfig);
  }

  function updateAndWriteConfig(configFilePath, gtbConfigTemplate) {
    configFilePath = global.prefix + configFilePath;
    // if config file doesn't exist, write a new file with the default gtb template settings
    if (!fileExists(configFilePath)) {
      writeFile(configFilePath, gtbConfigTemplate, {spaces: 2});
      return;
    }

    //if config file exists, check if some properties don't exist in the gtb default template anymore and remove them
    var configItems = readFile(configFilePath);

    // save the new config file
    var finalConfigItems = checkConfigItems(configItems, gtbConfigTemplate);

    writeFile(configFilePath, finalConfigItems, {spaces: 2});
    return finalConfigItems;
  }

  gulpConfig.projectConfig = updateAndWriteConfig(files.GULP_CONFIG, gtbProjectConfigTemplate);
  gulpConfig.userConfig = updateAndWriteConfig(files.CUSTOM_CONFIG, gtbUserConfigTemplate);

};