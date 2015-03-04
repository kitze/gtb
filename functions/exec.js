module.exports = function (scriptPath) {
  var exec = require('child_process').exec;
  exec(scriptPath, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null)
      console.log('exec error: ' + error);
  });
};