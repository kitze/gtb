module.exports = function () {

  var fs       = require('fs'),
      jsonfile = require('jsonfile'),
      files = require('../config/files-config');

  /* If a gulp config doesn't exist for the project generate one that will be global for the project */
  if (!fs.existsSync(files.GULP_CONFIG)) {
    fs.writeFileSync(files.GULP_CONFIG, JSON.stringify(gulpConfigTemplate));
  }

  /* If a custom gulp config doesn't exist generate one so every user can have his custom settings */
  if (!fs.existsSync(files.CUSTOM_CONFIG)) {
    fs.writeFileSync(files.CUSTOM_CONFIG, JSON.stringify(_(gulpConfigTemplate).omit(
      [
        'additionalBowerFiles',
        'imagesFolder',
        'copyToFolder'
      ]
    )));
  }

};