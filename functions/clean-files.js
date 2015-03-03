module.exports = function () {
  return function (files, logMessage){
      console.log('-------------------------------------------------- CLEAN :' + logMessage);
      del(files);
  }
};