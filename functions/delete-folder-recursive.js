module.exports = function () {
  var fs = require ('fs');
  return function (path){
    console.log('path is', path);
    if (fs.existsSync(path)) {
      console.log('yup');
      fs.readdirSync(path).forEach(function (file) {
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          d(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
    else{
      console.log('nope');
    }
  };
};

