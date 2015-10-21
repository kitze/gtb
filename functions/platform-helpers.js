var os = require('os');
var osName = require('os-name');

var currentOs = osName();
var examplePaths = {
  'mac': '/Users/john/projects/myproject/',
  'linux': '/home/john/projects/myproject/',
  'windows:': "C:/Users/John/projects/myproject/"
};
var osNameShort = examplePaths['mac'];

if (isMac()) {
  osNameShort = 'mac';
}
if (isWindows()) {
  osNameShort = 'windows';
}

if (isLinux()) {
  osNameShort = 'linux';
}

function containsLowercase(a, b) {
  return a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
}

function isMac() {
  return containsLowercase(currentOs, 'os x');
}

function isLinux() {
  return containsLowercase(currentOs, 'linux');
}

function isWindows() {
  return containsLowercase(currentOs, 'windows');
}

function getExamplePathByOs() {
  return examplePaths[osNameShort];
}


module.exports = {
  isMac: isMac,
  isLinux: isLinux,
  isWindows: isWindows,
  getExamplePathByOs: getExamplePathByOs,
  getOS: function () {
    return currentOs;
  }
};