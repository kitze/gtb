module.exports = function (gulp, plugins, config) {
  var exec = require('../functions/exec');
  exec(config.dirs.prefix + "minify.sh");
};