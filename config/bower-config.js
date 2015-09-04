var directories = require('../config/directories-config');

module.exports = {
  paths: {
    "bowerJson": global.prefix + 'bower.json',
    "bowerDirectory": global.prefix + directories.bower
  }
};