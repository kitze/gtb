module.exports = function (gulp, plugins, config) {

  var bowerFiles = require('main-bower-files');
  var fs = require('extfs');
  var con = require('../functions/console');
  var $q = require('deferred');
  var bowerSettings = require('../config/bower-config');
  var directories = require('../config/directories-config');

  require('shelljs/global');

  return function () {
    var def = $q();

    if (!which('bower')) {
      con.err('Bower is not installed. Please install it with "npm install -g bower" before you run the script again.');
      exit(-1);
    }

    var bowerDirectoryPath = global.prefix + directories.bower;

    try {
      fs.lstatSync(bowerDirectoryPath);
      def.resolve(bowerFiles(bowerSettings));
    }
    catch (e) {
      con.err('Bower components directory doesn\'t exist');
      con.err('Please run bower-install in your directory before you run gtb again.');
      exit(-1);
    }

    return def.promise;
  }

};