module.exports = function () {
  var deleteFolderRecursive = require('../functions/delete-folder-recursive');
  return function () {
    deleteFolderRecursive('build');
  }
};