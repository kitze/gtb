var fs         = require('fs'),
    os         = require('os'),
    con        = require('../functions/console'),
    _          = require('lodash'),
    fileExists = fs.existsSync,
    files      = require('../config/files-config');

module.exports = function () {

  var gitIgnoreFilePath = global.prefix + files.GIT_IGNORE;
  var gulpConfig = require('../functions/gulp-config').userConfig;
  var defaultGitIgnoreItems = require('../config/git-ignore-config');

  function writeGitIgnore(items) {
    fs.writeFileSync(gitIgnoreFilePath, _(items).compact().join(os.EOL), 'utf8');
  }

  if (gulpConfig.gtb.modifyGitignore === true) {
    // if .gitignore doesn't exist for the project create it and fill it with predefined template
    if (!fileExists(gitIgnoreFilePath)) {
      con.hint('Creating .gitignore');
      writeGitIgnore(defaultGitIgnoreItems);
      return;
    }

    // get current git ignore file and split it by empty line into an array
    var existingGitIgnoreItems = fs.readFileSync(gitIgnoreFilePath, 'utf8').split(os.EOL);

    // check if the current .gitignore contains all the content from the .gitignore template, and add it if it doesn't
    if (existingGitIgnoreItems.length !== 0) {
      con.hint('Improving .gitignore');
      writeGitIgnore(_.uniq(existingGitIgnoreItems.concat(defaultGitIgnoreItems)));
    }
  }

};