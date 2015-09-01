var jsonFile = require('jsonfile'),
    readFile = jsonFile.readFileSync,
    _        = require('underscore'),
    files    = require('../config/files-config');

module.exports = function () {

  // Get the default gulp config & merge it with the custom gulp config so every custom setting can be overriden
  return _.extend(readFile(files.GULP_CONFIG), readFile(files.CUSTOM_CONFIG));

};
