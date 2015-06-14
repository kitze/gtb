module.exports = function (gulp, plugins, config) {

  var bowerFiles = require('main-bower-files');
  var fs = require('extfs');
  var con = require('../functions/console');
  var $q = require('deferred');
  require('shelljs/global');

  var bowerSettings = {
    paths: {
      "bowerJson": global.prefix + 'bower.json',
      "bowerDirectory": global.prefix + config.dirs.bower
    }
  };

  return function () {
    var def = $q();

    if (!which('bower')) {
      con.err('Bower is not installed. Please install it with "npm install -g bower" before you run the script again.');
      exit(-1);
    }

    function installBowerComponents() {
      con.hint('Fixing bower components...');
      exec("( cd " + global.prefix + "; bower prune; bower install )");
      def.resolve(bowerFiles(bowerSettings));
    }

    con.hint('Getting bower files ... ');
    var bowerDirectoryPath = global.prefix + config.dirs.bower;

    try {
      var bowerDirectory = fs.lstatSync(bowerDirectoryPath);
      var foldersInsideBowerDirectory = fs.getDirsSync(bowerDirectoryPath).length;
      var bowerFile = JSON.parse(fs.readFileSync(global.prefix + "bower.json", 'utf8'));
      var bowerDependenciesNumber = Object.keys(bowerFile.dependencies).length + (bowerFile.devDependencies !== undefined ? Object.keys(bowerFile.devDependencies).length : 0);
      /* if bower_components exists */
      if (bowerDirectory.isDirectory() === true) {
        con.hint("Bower directory exists");
        /* if there are no folders in bower_components run bower install */
        if (fs.isEmptySync(bowerDirectoryPath) === true) {
          con.err('Bower directory is empty!');
          installBowerComponents();
        }
        /* if some folders are missing from bower_components run bower install */
        else if (foldersInsideBowerDirectory < bowerDependenciesNumber) {
          con.err('The bower components folder doesn\'t match the bower.json file', foldersInsideBowerDirectory, bowerDependenciesNumber);
          installBowerComponents();
        }
        else {
          con.hint('Bower directory is ok');
          def.resolve(bowerFiles(bowerSettings));
        }
      }
    }
    catch (e) {
      con.err('Bower components directory doesn\'t exist, creating it...');
      fs.mkdirSync(bowerDirectoryPath);
      /* Executes bower install in a sub-shell before it continues */
      installBowerComponents();
    }

    return def.promise;
  }

};