module.exports = function (config) {
  var _ = require('underscore');
  var dir = require('../functions/dir')(config);

  function fd(fileType, directory, deep) {
    var arr = [];
    if (typeof fileType === 'string' && (!directory || typeof directory === 'string')) {
      var d = directory===''?'':config.dirs[directory ? directory : fileType];
      d = d!==''?(d+'/'):'';
      arr = [dir(d+ '*.' + fileType)];
      if (deep !== false) {
        arr.push(dir(d+'**/*.' + fileType));
      }
    }
    else if (typeof fileType === 'object' && (!directory || typeof directory === 'string')) {
      _(fileType).each(function (type) {
        arr = arr.concat(fd(type, directory));
      });
    }
    else if (typeof fileType === 'string' && (!directory || typeof directory === 'object')) {
      _(directory).each(function (dir) {
        arr = arr.concat(fd(fileType, dir));
      });
    }
    return arr;
  }

  return fd;
};