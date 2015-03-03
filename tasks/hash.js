module.exports = function () {
  var exec = require('child_process').exec;
  exec("./minify.sh", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null)
      console.log('exec error: ' + error);
  });
};