var fs                    = require('fs'),
    os                    = require('os'),
    con                   = require('../functions/console'),
    _                     = require('underscore'),
    fileExists            = fs.existsSync,
    defaultGitIgnoreItems = require('../config/git-ignore-config'),
    files                 = require('../config/files-config');

module.exports = function () {

  function writeGitIgnore(items) {
    fs.writeFileSync(files.GIT_IGNORE, _(items).compact().join(os.EOL), 'utf8');
  }

  // if .gitignore doesn't exist for the project create it and fill it with predefined template
  if (!fileExists(files.GIT_IGNORE)) {
    con.hint('Creating .gitignore');
    writeGitIgnore(defaultGitIgnoreItems);
    return;
  }

  // get current git ignore file and split it by empty line into an array
  var existingGitIgnoreItems = fs.readFileSync(files.GIT_IGNORE, 'utf8').split(os.EOL);

  // check if the current .gitignore contains all the content from the .gitignore template, and add it if it doesn't
  if (existingGitIgnoreItems.length !== 0) {
    con.hint('Improving .gitignore');
    writeGitIgnore(_.uniq(existingGitIgnoreItems.concat(defaultGitIgnoreItems)));
  }

};