#! /usr/bin/env node

//node
import {existsSync}  from 'fs';
import path from 'path';

//node_modules
import _ from 'underscore';
import runSequence from 'run-sequence';
import shell from 'shelljs/global';
import inq from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import program from 'commander';
import {readFileSync, readFile, writeFileSync, writeFile} from 'jsonfile';
import {Validator} from 'jsonschema';

//custom
import con from '../functions/console';
import writeGulpConfigFiles from '../functions/write-gulp-config-files';
import writeBowerConfig from '../functions/write-bower-config';
import fixGitIgnore from '../functions/fix-git-ignore';
import jsonSchemas from '../config/json-schemas-config';
import platformHelpers from '../functions/platform-helpers';

//globals
global.isProduction = false;
global.currentProject = undefined;

//constants
const jsonFileSettings = {spaces: 2};
const jsonValidator = new Validator();
const operatingSystem = platformHelpers.getOS();
const usersHome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const gtbConfigPath = usersHome + '/.gtb-config.json';

//variables
let gtbConfig;
let gtbCommands = [
  //commands
  {
    name: 'list'
  },
  {
    name: 'add'
  },
  {
    name: 'delete'
  },
  {
    name: 'deploy'
  },
  //options & flags
  {
    name: 'name'
  },
  {
    name: 'task',
    depends: ['name']
  },
  {
    name: '.'
  },
  {
    name: 'production',
    depends: ['name']
  }
];

/* ====== Initialize ====== */

figlet('GTB', function (err, data) {
  console.log(data.toString());
  gtbConfig = readGtbConfig();
  initialize();
});

function addCliCommands() {
  program
    .option('-n, --name [projectName]', 'option: Run project')
    .option('-t, --task [taskName]', 'option: Run specific gulp task on a project [default]', 'default')
    .option('-p, --production', 'option: Set production mode')
    .option('list', 'command: List all the projects')
    .option('add [add]', 'command: Adds a new project to gtb')
    .option('deploy [deploy]', 'command: Deploys project to surge.sh')
    .option('delete [delete]', 'command: Deletes project')
    .option('.')
    .parse(process.argv);
}

function initialize() {
  addCliCommands();

  //if gtb-config doesn't exist, create it then read it and parse the cli arguments
  if (_.isUndefined(gtbConfig)) {
    con.log(`Creating gtb-config for the first time...`);
    writeFile(gtbConfigPath, {
      projects: []
    }, jsonFileSettings, () => {
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
  var command = program[name];
  return command !== undefined && (typeof command === 'string' || typeof command === 'boolean');
}

function parseArguments() {
  var commandWasExecuted = _.some(gtbCommands, (command)=> {
    return checkIfCommandExists(command.name) && _.every(command.depends, checkIfCommandExists);
  });

  if (!commandWasExecuted) {
    displayGtbActions();
    return;
  }

  //lists all the projects
  if (program.list) {
    listProjects();
    return;
  }

  if (program.delete) {
    var foundProject = getProjectByName(program.delete);
    if (foundProject === undefined) {
      displayProjectNotFoundError();
      return;
    }
    deleteProject(foundProject);
  }

  //deploys project
  if (program.deploy) {
    var foundProject = getProjectByName(program.deploy);
    if (foundProject === undefined) {
      displayProjectNotFoundError();
      return;
    }
    runProject(foundProject, 'deploy:surge');
    return;
  }

  //add a new project
  if (program.add) {
    var newProject = {};
    if (typeof program.add === 'string') {
      if (program.add === '.') {
        newProject.location = currentProcessPath();
      }
    }
    addNewProjectPrompt(newProject);
    return;
  }

  //sets the production flag
  if (program.production) {
    global.isProduction = true;
  }

  if (program['.']) {
    runProject({
      location: currentProcessPath()
    }, program.task, true);
    return;
  }

  if (program.name && typeof program.name === 'string') {
    var foundProject = getProjectByName(program.name);
    if (foundProject === undefined) {
      displayProjectNotFoundError();
      return;
    }

    runProject(foundProject, program.task, true);
  }
}

//error messages
function invalidProjectsJsonMessage() {
  con.err('gtb-config is not a valid json file, please check it for errors!');
  exit(-1);
}

function displayProjectNotFoundError() {
  con.err(`Project with that name wasn't found.`);
  displayGtbActions();
}

function showErrorForProjectsJson(exception) {
  con.err('Error in the main gtb-config file:');
  con.log(exception.toString());
}

function currentProcessPath() {
  return process.cwd() + '/';
}

function readGtbConfig() {

  //check if file exists
  if (!existsSync(gtbConfigPath)) {
    con.err(`gtb-config file doesn't exist.`);
    return undefined;
  }

  //check if the file is a valid json file
  try {
    gtbConfig = readFileSync(gtbConfigPath);
  } catch (exception) {
    showErrorForProjectsJson(exception);
    exit(-1);
  }

  //check if the json file follows the correct json schema
  jsonValidator.addSchema(jsonSchemas.singleProject, '/SingleProjectSchema');
  var gtbConfigValidation = jsonValidator.validate(gtbConfig, jsonSchemas.gtbConfig);

  if (gtbConfigValidation.errors.length > 0) {
    con.err('Errors in gtb-config file:');
    _.each(gtbConfigValidation.errors, (error) => {
      con.log(error.stack);
    });
    exit(-1);
  }

  return gtbConfig;
}

function getProjectByName(name) {
  return _.findWhere(gtbConfig.projects, {name: name});
}

function checkNumberOfProjects() {
  var projects = gtbConfig.projects;
  if (projects.length === 0) {
    con.hint(`You don't have any projects in gtb yet, so let's add your first one!`);
    addNewProjectPrompt();
    return 0;
  }

  // If there's only run project run that one by default *!/
  if (projects.length === 1) {
    con.hint(`You only have one project in gtb, choosing that one by default.`);
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

  inq.prompt({
    type: 'list',
    name: 'pickedProject',
    message: 'Pick a project:',
    choices: projects
  }, (answer) => {
    performAction(getProjectByName(answer.pickedProject));
  });
}

function deleteProject(project) {
  con.hint(`The project "${project.name}" was successfully deleted!`);
  gtbConfig.projects = _.filter(gtbConfig.projects, (p) => {
    return p.name !== project.name;
  });
  updateGtbConfig(true, gtbConfig);
}

function performAction(project) {

  var actions = [
    {
      name: 'Run',
      value: () => {
        runProject(project, 'default', true);
      }
    },
    {
      name: 'Build production version',
      value: () => {
        con.log(`Building production version of project "${project.name}"...`);
        runProject(project, 'build:only', false);
      }
    },
    {
      name: 'Build and run production version',
      value: () => {
        con.log(`Running production version of project "${project.name}"...`);
        runProject(project, 'build:serve', false);
      }
    },
    {
      name: 'Deploy production version to surge.sh',
      value: () => {
        runProject(project, 'deploy:surge', false);
      }
    },
    {
      name: 'Delete',
      value: function () {
        deleteProject(project);
      }
    }
  ];

  inq.prompt({
    type: 'list',
    name: 'actionToRun',
    message: `Pick which action would you like to perform on the project "${project.name}"?`,
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

  var actions = [
    {
      name: 'Create a new project',
      value: addNewProjectPrompt
    },
    {
      name: 'List all my projects',
      value: listProjects
    }
  ];

  var prompt = [{
    type: 'list',
    name: 'nextAction',
    message: `What do you want to do?`,
    choices: actions
  }];

  inq.prompt(prompt, (answers) => {
    answers.nextAction();
  });
}

function saveNewProject(newProject) {
  gtbConfig.projects.push(newProject);
  updateGtbConfig(true, gtbConfig);
}

function updateGtbConfig(displayListOfProjects, newConfig) {
  var config = newConfig === undefined ? gtbConfig : newConfig;
  writeFile(gtbConfigPath, config, jsonFileSettings, (error) => {
    if (error) {
      con.error(error);
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
    con.errorWithSpaces('Please provide a name for the project!');
    return false;
  }

  if (name.indexOf(" ") !== -1) {
    con.errorWithSpaces('The project name cannot contain spaces!');
    return false;
  }

  if (name.length > 20) {
    con.errorWithSpaces('The project name cannot be longer than 20 chars!');
    return false;
  }

  var projectWithSameName = _.findWhere(gtbConfig.projects, {name: name});

  if (!_.isUndefined(projectWithSameName)) {
    con.errorWithSpaces('Project with that name already exists, please choose another name!');
    return false;
  }

  return true;
}

function validateNewProjectPath(path) {

  path = path.trim();

  //location validation
  if (path.indexOf(" ") !== -1) {
    con.errorWithSpaces('The path of the project cannot contain spaces!');
    return false;
  }

  if (path === '') {
    con.errorWithSpaces('Please provide a path for the project!');
    return false;
  }

  var projectWithSamePath = _.find(gtbConfig.projects, (project) => {
    return project.location === path || project.location === (path + '/');
  });

  if (!_.isUndefined(projectWithSamePath)) {
    con.errorWithSpaces('Project with that path already exists, please choose another path!');
    return false;
  }

  //try to add a trailing slash to the path if the user forgot
  path = fixPathTrailingSlash(path);

  if (!existsSync(path)) {
    con.errorWithSpaces('The path of the project is not valid, please add a valid path!');
    return false;
  }

  return true;
}

function fixPathTrailingSlash(path) {
  var lastCharacter = path[(path.length - 1)];
  if (lastCharacter !== '/') {
    path = path + '/';
  }
  return path;
}

function addNewProjectPrompt(existingProject) {
  var pathExample = platformHelpers.getExamplePathByOs();

  var nameQuestion = {
    type: 'input',
    name: 'name',
    message: `What is the project name? (No spaces, max 20 characters)`,
    validate: validateNewProjectName
  };

  var pathQuestion = {
    type: 'input',
    name: 'location',
    message: `What is full absolute path of the project? (i.e: ${pathExample})`,
    filter: (path) => {
      return fixPathTrailingSlash(path);
    },
    validate: validateNewProjectPath
  };

  var questions = [nameQuestion];

  if (existingProject !== undefined && existingProject.location) {
    if (validateNewProjectPath(existingProject.location) === false) {
      return;
    }
  }
  else {
    questions.push(pathQuestion);
  }

  inq.prompt(questions, (newProject) => {
    saveNewProject(existingProject !== undefined ? _.extend(existingProject, newProject) : newProject);
  });
}

function runProject(project, task, displayLog) {
  //initialize
  global.prefix = project.location;

  //log
  if (displayLog && project.name !== undefined) {
    con.log(`Running project "${project.name}"...`);
  }

  //write configs and gitignore
  writeGulpConfigFiles().then(() => {
    writeBowerConfig();

    //only fix gitignore if the user hasn't specified a task to run
    if (task === undefined || task === undefined) {
      fixGitIgnore();
    }

    //gulp
    require('../tasks/all-gulp-tasks')();
    runSequence(task === undefined ? 'default' : task);
  });
}
