module.exports = function () {

  var fs              = require('fs'),
      os              = require('os'),
      con             = require('../functions/console'),
      _               = require('underscore'),
      shouldGitIgnore = require('../config/git-ignore-config'),
      files           = require('../config/files-config');

  var newGitIgnore;

  if (fs.existsSync(files.GIT_IGNORE)) {
    var currentGitIgnoreItems = fs.readFileSync(files.GIT_IGNORE, 'utf8').split(os.EOL);
    if (currentGitIgnoreItems.length !== 0) {
      con.hint('Improving .gitignore');
      _(shouldGitIgnore).each(function (item) {
        if (currentGitIgnoreItems.indexOf(item) == -1) {
          currentGitIgnoreItems.push(item);
        }
      });
      newGitIgnore = currentGitIgnoreItems;
    }
  }
  else {
    con.hint('Creating .gitignore');
    newGitIgnore = shouldGitIgnore;
  }

  fs.writeFileSync(files.GIT_IGNORE, _(newGitIgnore).compact().join(os.EOL));
};