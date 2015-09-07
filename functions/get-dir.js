var directories = require('../config/directories-config');
var _ = require('underscore');

var build = function build(folderName) {
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
    _(fileType).each(function (type) {
      finalPaths = finalPaths.concat(files(type, directory));
    });
  }
  else if (oneFileType && (!directory || !oneDirectory)) {
    _(directory).each(function (dir) {
      finalPaths = finalPaths.concat(files(fileType, dir));
    });
  }
  return finalPaths;
};

module.exports = {
  build: build,
  src: src,
  files: files
};