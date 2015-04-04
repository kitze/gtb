var runSequence = require('run-sequence');
var fs = require('fs');
var _ = require('underscore');

module.exports = function (gulp, plugins, config) {
  return function () {
    fs.readFile('./projects.json', 'utf8', function (err, data) {
      var projects = JSON.parse(data);
      console.log('projects', projects);
      var projectName = config.args.n;
      var foundProject = _(projects).findWhere({name: projectName});
      if (foundProject !== undefined) {
        global.prefix = foundProject.location;
        console.log('setting prefix to', global.prefix);
        runSequence('default');
      }
    });
  }
};