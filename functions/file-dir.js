module.exports = function (config) {
  var _ = require('underscore');
  function fd (fileType, directory, deep) {
    var arr = [];
    if (typeof fileType === 'string' && (!directory || typeof directory === 'string')) {
      var dir = config.dirs.src[directory ? directory : fileType];
      arr = [dir + '*.' + fileType];
      if (deep !== false) {
        arr.push(dir + '**/*.' + fileType);
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