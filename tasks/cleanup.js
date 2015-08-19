module.exports = function (gulp, plugins, config) {
  
  var fs = require('fs');
  var del = require('del');
  var dir = require('../functions/dir')(config);
  var bdir = require('../functions/build-dir')(config);
  var con = require('../functions/console');

  return function () {
    con.hint('Cleaning up...');
    var revFolder = bdir('rev');
    del(revFolder,{
      force:true
    });
  }
};