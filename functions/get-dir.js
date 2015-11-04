var directories = require('../config/directories-config');
var _ = require('lodash');

var build = function build(folderName) {
  folderName = folderName || '';
  return global.prefix + directories.build + "/" + folderName;
};

var src = function src(folder) {
  return global.prefix + directories.app + "/" + folder;
};

var files = function files(fileType, directory) {
  var finalPaths = [];
  var oneFileType = typeof fileType === 'string';
  var oneDirectory = typeof directory === 'string';

  if (oneFileType && (!directory || oneDirectory)) {
    if (!_.isEmpty(directory)) {
      directory = directories[directory] + '/';
    }
    finalPaths = [src(directory + '**/*.' + fileType), src(directory + '*.' + fileType)];
  }
  else if (!oneFileType && (!directory || oneDirectory)) {
    _.each(fileType, function (type) {
      finalPaths = finalPaths.concat(files(type, directory));
    });
  }
  else if (oneFileType && (!directory || !oneDirectory)) {
    _.each(directory, function (dir) {
      finalPaths = finalPaths.concat(files(fileType, dir));
    });
  }
  return finalPaths;
};

var file = function file(name) {
  return global.prefix + name;
};

module.exports = {
  build: build,
  src: src,
  files: files,
  file: file
};