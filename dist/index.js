#! /usr/bin/env node
'use strict';

var _fs = require('fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

var _global = require('shelljs/global');

var _global2 = _interopRequireDefault(_global);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _figlet = require('figlet');

var _figlet2 = _interopRequireDefault(_figlet);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _jsonfile = require('jsonfile');

var _jsonschema = require('jsonschema');

var _console = require('../functions/console');

var _console2 = _interopRequireDefault(_console);

var _writeGulpConfigFiles = require('../functions/write-gulp-config-files');

var _writeGulpConfigFiles2 = _interopRequireDefault(_writeGulpConfigFiles);

var _writeBowerConfig = require('../functions/write-bower-config');

var _writeBowerConfig2 = _interopRequireDefault(_writeBowerConfig);

var _fixGitIgnore = require('../functions/fix-git-ignore');

var _fixGitIgnore2 = _interopRequireDefault(_fixGitIgnore);

var _jsonSchemasConfig = require('../config/json-schemas-config');

var _jsonSchemasConfig2 = _interopRequireDefault(_jsonSchemasConfig);

var _platformHelpers = require('../functions/platform-helpers');

var _platformHelpers2 = _interopRequireDefault(_platformHelpers);

var _allGulpTasks = require('../tasks/all-gulp-tasks');

var _allGulpTasks2 = _interopRequireDefault(_allGulpTasks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//globals

//node_modules

//node
global.isProduction = false;

//custom

global.currentProject = undefined;

//constants
var jsonFileSettings = { spaces: 2 };
var jsonValidator = new _jsonschema.Validator();
var operatingSystem = _platformHelpers2.default.getOS();
var usersHome = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
var gtbConfigPath = usersHome + '/.gtb-config.json';

//variables
var gtbConfig = undefined;
var gtbCommands = [
//commands
{
  name: 'list'
}, {
  name: 'add'
}, {
  name: 'delete'
}, {
  name: 'deploy'
},
//options & flags
{
  name: 'name'
}, {
  name: 'task',
  depends: ['name']
}, {
  name: '.'
}, {
  name: 'production',
  depends: ['name']
}];

/* ====== Initialize ====== */

(0, _figlet2.default)('GTB', function (err, data) {
  console.log(data.toString());
  gtbConfig = readGtbConfig();
  initialize();
});

function addCliCommands() {
  _commander2.default.option('-n, --name [projectName]', 'option: Run project').option('-t, --task [taskName]', 'option: Run specific gulp task on a project [default]', 'default').option('-p, --production', 'option: Set production mode').option('list', 'command: List all the projects').option('add [add]', 'command: Adds a new project to gtb').option('deploy [deploy]', 'command: Deploys project to surge.sh').option('delete [delete]', 'command: Deletes project').option('.').parse(process.argv);
}

function initialize() {
  addCliCommands();

  //if gtb-config doesn't exist, create it then read it and parse the cli arguments
  if (_lodash2.default.isUndefined(gtbConfig)) {
    _console2.default.log('Creating gtb-config for the first time...');
    (0, _jsonfile.writeFile)(gtbConfigPath, {
      projects: []
    }, jsonFileSettings, function () {
      readGtbConfig();
      parseArguments();
    });
  }
  //if gtb config exists, just parse the arguments
  else {
      parseArguments();
    }
}

function checkIfCommandExists(name) {
  var command = _commander2.default[name];
  return command !== undefined && (typeof command === 'string' || typeof command === 'boolean');
}

function parseArguments() {
  var commandWasExecuted = _lodash2.default.some(gtbCommands, function (command) {
    return checkIfCommandExists(command.name) && _lodash2.default.every(command.depends, checkIfCommandExists);
  });

  if (!commandWasExecuted) {
    displayGtbActions();
    return;
  }

  //lists all the projects
  if (_commander2.default.list) {
    listProjects();
    return;
  }

  if (_commander2.default.delete) {
    var foundProject = getProjectByName(_commander2.default.delete);
    if (foundProject === undefined) {
      displayProjectNotFoundError();
      return;
    }
    deleteProject(foundProject);
  }

  //deploys project
  if (_commander2.default.deploy) {
    var foundProject = getProjectByName(_commander2.default.deploy);
    if (foundProject === undefined) {
      displayProjectNotFoundError();
      return;
    }
    runProject(foundProject, 'deploy:surge');
    return;
  }

  //add a new project
  if (_commander2.default.add) {
    var newProject = {};
    if (typeof _commander2.default.add === 'string') {
      if (_commander2.default.add === '.') {
        newProject.location = currentProcessPath();
      }
    }
    addNewProjectPrompt(newProject);
    return;
  }

  //sets the production flag
  if (_commander2.default.production) {
    global.isProduction = true;
  }

  if (_commander2.default['.']) {
    runProject({
      location: currentProcessPath()
    }, _commander2.default.task, true);
    return;
  }

  if (_commander2.default.name && typeof _commander2.default.name === 'string') {
    var foundProject = getProjectByName(_commander2.default.name);
    if (foundProject === undefined) {
      displayProjectNotFoundError();
      return;
    }

    runProject(foundProject, _commander2.default.task, true);
  }
}

//error messages
function invalidProjectsJsonMessage() {
  _console2.default.err('gtb-config is not a valid json file, please check it for errors!');
  exit(-1);
}

function displayProjectNotFoundError() {
  _console2.default.err('Project with that name wasn\'t found.');
  displayGtbActions();
}

function showErrorForProjectsJson(exception) {
  _console2.default.err('Error in the main gtb-config file:');
  _console2.default.log(exception.toString());
}

function currentProcessPath() {
  return process.cwd() + '/';
}

function readGtbConfig() {

  //check if file exists
  if (!(0, _fs.existsSync)(gtbConfigPath)) {
    _console2.default.err('gtb-config file doesn\'t exist.');
    return undefined;
  }

  //check if the file is a valid json file
  try {
    gtbConfig = (0, _jsonfile.readFileSync)(gtbConfigPath);
  } catch (exception) {
    showErrorForProjectsJson(exception);
    exit(-1);
  }

  //check if the json file follows the correct json schema
  jsonValidator.addSchema(_jsonSchemasConfig2.default.singleProject, '/SingleProjectSchema');
  var gtbConfigValidation = jsonValidator.validate(gtbConfig, _jsonSchemasConfig2.default.gtbConfig);

  if (gtbConfigValidation.errors.length > 0) {
    _console2.default.err('Errors in gtb-config file:');
    _lodash2.default.each(gtbConfigValidation.errors, function (error) {
      _console2.default.log(error.stack);
    });
    exit(-1);
  }

  return gtbConfig;
}

function getProjectByName(name) {
  return _lodash2.default.findWhere(gtbConfig.projects, { name: name });
}

function checkNumberOfProjects() {
  var projects = gtbConfig.projects;
  if (projects.length === 0) {
    _console2.default.hint('You don\'t have any projects in gtb yet, so let\'s add your first one!');
    addNewProjectPrompt();
    return 0;
  }

  // If there's only run project run that one by default *!/
  if (projects.length === 1) {
    _console2.default.hint('You only have one project in gtb, choosing that one by default.');
    performAction(projects[0]);
    return 1;
  }

  return projects.length;
}

function listProjects() {
  var projects = gtbConfig.projects;

  var numberOfProjects = checkNumberOfProjects();

  if (numberOfProjects < 2) {
    return;
  }

  _inquirer2.default.prompt({
    type: 'list',
    name: 'pickedProject',
    message: 'Pick a project:',
    choices: projects
  }, function (answer) {
    performAction(getProjectByName(answer.pickedProject));
  });
}

function deleteProject(project) {
  _console2.default.hint('The project "' + project.name + '" was successfully deleted!');
  gtbConfig.projects = _lodash2.default.filter(gtbConfig.projects, function (p) {
    return p.name !== project.name;
  });
  updateGtbConfig(true, gtbConfig);
}

function performAction(project) {

  var actions = [{
    name: 'Run',
    value: function value() {
      runProject(project, 'default', true);
    }
  }, {
    name: 'Build production version',
    value: function value() {
      _console2.default.log('Building production version of project "' + project.name + '"...');
      runProject(project, 'build:only', false);
    }
  }, {
    name: 'Build and run production version',
    value: function value() {
      _console2.default.log('Running production version of project "' + project.name + '"...');
      runProject(project, 'build:serve', false);
    }
  }, {
    name: 'Deploy production version to surge.sh',
    value: function value() {
      runProject(project, 'deploy:surge', false);
    }
  }, {
    name: 'Delete',
    value: function value() {
      deleteProject(project);
    }
  }];

  _inquirer2.default.prompt({
    type: 'list',
    name: 'actionToRun',
    message: 'Pick which action would you like to perform on the project "' + project.name + '"?',
    choices: actions
  }, function (answer) {
    answer.actionToRun();
  });
}

function displayGtbActions(project) {

  var numberOfProjects = checkNumberOfProjects();

  if (numberOfProjects < 2) {
    return;
  }

  var actions = [{
    name: 'Create a new project',
    value: addNewProjectPrompt
  }, {
    name: 'List all my projects',
    value: listProjects
  }];

  var prompt = [{
    type: 'list',
    name: 'nextAction',
    message: 'What do you want to do?',
    choices: actions
  }];

  _inquirer2.default.prompt(prompt, function (answers) {
    answers.nextAction();
  });
}

function saveNewProject(newProject) {
  gtbConfig.projects.push(newProject);
  updateGtbConfig(true, gtbConfig);
}

function updateGtbConfig(displayListOfProjects, newConfig) {
  var config = newConfig === undefined ? gtbConfig : newConfig;
  (0, _jsonfile.writeFile)(gtbConfigPath, config, jsonFileSettings, function (error) {
    if (error) {
      _console2.default.error(error);
      exit(-1);
    }

    if (displayListOfProjects === true) {
      listProjects();
    }
  });
}

function validateNewProjectName(name) {
  name = name.trim();

  //name validation
  if (name === '') {
    _console2.default.errorWithSpaces('Please provide a name for the project!');
    return false;
  }

  if (name.indexOf(" ") !== -1) {
    _console2.default.errorWithSpaces('The project name cannot contain spaces!');
    return false;
  }

  if (name.length > 20) {
    _console2.default.errorWithSpaces('The project name cannot be longer than 20 chars!');
    return false;
  }

  var projectWithSameName = _lodash2.default.findWhere(gtbConfig.projects, { name: name });

  if (!_lodash2.default.isUndefined(projectWithSameName)) {
    _console2.default.errorWithSpaces('Project with that name already exists, please choose another name!');
    return false;
  }

  return true;
}

function validateNewProjectPath(path) {

  path = path.trim();

  //location validation
  if (path.indexOf(" ") !== -1) {
    _console2.default.errorWithSpaces('The path of the project cannot contain spaces!');
    return false;
  }

  if (path === '') {
    _console2.default.errorWithSpaces('Please provide a path for the project!');
    return false;
  }

  var projectWithSamePath = _lodash2.default.find(gtbConfig.projects, function (project) {
    return project.location === path || project.location === path + '/';
  });

  if (!_lodash2.default.isUndefined(projectWithSamePath)) {
    _console2.default.errorWithSpaces('Project with that path already exists, please choose another path!');
    return false;
  }

  //try to add a trailing slash to the path if the user forgot
  path = fixPathTrailingSlash(path);

  if (!(0, _fs.existsSync)(path)) {
    _console2.default.errorWithSpaces('The path of the project is not valid, please add a valid path!');
    return false;
  }

  return true;
}

function fixPathTrailingSlash(path) {
  var lastCharacter = path[path.length - 1];
  if (lastCharacter !== '/') {
    path = path + '/';
  }
  return path;
}

function addNewProjectPrompt(existingProject) {
  var pathExample = _platformHelpers2.default.getExamplePathByOs();

  var nameQuestion = {
    type: 'input',
    name: 'name',
    message: 'What is the project name? (No spaces, max 20 characters)',
    validate: validateNewProjectName
  };

  var pathQuestion = {
    type: 'input',
    name: 'location',
    message: 'What is full absolute path of the project? (i.e: ' + pathExample + ')',
    filter: function filter(path) {
      return fixPathTrailingSlash(path);
    },
    validate: validateNewProjectPath
  };

  var questions = [nameQuestion];

  if (existingProject !== undefined && existingProject.location) {
    if (validateNewProjectPath(existingProject.location) === false) {
      return;
    }
  } else {
    questions.push(pathQuestion);
  }

  _inquirer2.default.prompt(questions, function (newProject) {
    saveNewProject(existingProject !== undefined ? _lodash2.default.extend(existingProject, newProject) : newProject);
  });
}

function runProject(project, task, displayLog) {
  //initialize
  global.prefix = project.location;

  //log
  if (displayLog && project.name !== undefined) {
    _console2.default.log('Running project "' + project.name + '"...');
  }

  //write configs and gitignore
  (0, _writeGulpConfigFiles2.default)().then(function () {
    (0, _writeBowerConfig2.default)();

    //only fix gitignore if the user hasn't specified a task to run
    if (task === undefined) {
      (0, _fixGitIgnore2.default)();
    }

    //gulp
    _allGulpTasks2.default.load();
    (0, _runSequence2.default)(task === undefined ? 'default' : task);
  });
}
