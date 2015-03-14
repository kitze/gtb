module.exports = function () {
  var del = require('del');
  return function (files, logMessage){
      console.log('-------------------------------------------------- CLEAN :' + logMessage);
      del(files);
  }
};