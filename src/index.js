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
const jsonValidator = new Validator();
const operatingSystem = platformHelpers.getOS();
const usersHome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const gtbConfigPath = usersHome + '/.gtb-config.json';

//variables
let options = ['project', 'build', 'task', 'list', '.'];
let gtbConfig = readGtbConfig();


/* ====== Initialize ====== */

console.log(chalk.bold.green('-> Gulp the Builder <-\n'));
initialize();

/*

 gtb -- displays options
 gtb list -- lists projects
 gtb add -- adds a new project
 gtb add . -- adds the current project to gtb
 gtb  ohtell -- removes project from gtb
 gtb . -- runs current directory
 gtb . -p -- runs current directory in production mode
 gtb . -p -t process:css -- runs the process:css task in production mode
 gtb -n ohtell -- runs project with name ohtell
 gtb -n ohtell -t deploy:surge -- deploys the current project to surge
 gtb -n ohtell -t process:js -p -- runs the process:js task of the project `ohtell` in production mode

 */

function initialize() {
  //arguments
  program
    .option('-n, --name [projectName]', 'option: Run project')
    .option('-t, --task [taskName]', 'option: Run specific gulp task on a project [default]', 'default')
    .option('-p, --production', 'option: Set production mode')
    .option('list', 'command: List all the projects')
    .option('add [add]', 'command: Adds a new project to gtb')
    .option('deploy [deploy]', 'command: Deploys project to surge.sh')
    .option('.')
    .parse(process.argv);

  if (_.isUndefined(gtbConfig)) {
    con.log(`gtb-config file doesn't exist, creating it for the first time...`);
    writeFile(gtbConfigPath, {
      projects: []
    }, {spaces: 2}, function (err) {
      readGtbConfig();
      parseArguments();
    });
  }
  else {
    parseArguments();
  }

  function parseArguments() {
    //lists all the projects
    if (program.list) {
      console.log('program.list');
      listProjects();
      return;
    }

    //deploys project
    if (program.deploy) {
      var foundProject = getProjectByName(program.deploy);
      if (foundProject === undefined) {
        con.err(`Project with that name wasn't found.`);
        displayGtbActions();
        return;
      }
      runProject(foundProject, 'deploy:surge');
      return;
    }

    //add a new project
    if (program.add) {
      var newProject = {};
      if (typeof program.add === 'string') {
        newProject.name = program.add;
      }
      if (program['.']) {
        newProject.location = currentProcessPath();
      }
      console.log('newProject', newProject);
      addNewProjectPrompt(newProject);
      return;
    }

    //sets the production flag
    if (program.production) {
      global.isProduction = true;
      console.log('building', program.build);
    }

    if (program['.']) {
      runProject({
        location: currentProcessPath()
      }, program.taskName);
      return;
    }

    if (program.name && typeof program.name === 'string') {
      var foundProject = getProjectByName(program.name);
      if (foundProject === undefined) {
        con.err(`Project with that name wasn't found.`);
        displayGtbActions();
        return;
      }

      runProject(foundProject, program.task);
    }

  }
}

//error messages
function invalidProjectsJsonMessage() {
  console.log('gtb-config is not a valid json file, please check it for errors!');
  exit(-1);
}

function showErrorForProjectsJson() {
  con.err('Error in the main gtb-config file:');
  con.log(exception.toString());
}

function currentProcessPath() {
  return process.cwd() + '/';
}

function readGtbConfig() {

  con.log('Reading GTB config ...');
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
    _.each(gtbConfigValidation.errors, function (error) {
      con.log(error.stack);
    });
    exit(-1);
  }

  return gtbConfig;
}

function getProjectByName(name) {
  return _.findWhere(gtbConfig.projects, {name: name});
}

function listProjects() {
  var projects = gtbConfig.projects;

  if (projects.length === 0) {
    con.hint(`You don't have any projects in gtb yet, so let's add your first one!`);
    addNewProjectPrompt();
    return;
  }

  // If there's only run project run that one by default *!/
  if (projects.length === 1) {
    con.hint(`You only have one project in gtb, choosing that one by default.`);
    performAction(projects[0]);
    return;
  }

  inq.prompt({
    type: 'list',
    name: 'pickedProject',
    message: 'Pick a project:',
    choices: projects
  }, function (answer) {
    performAction(getProjectByName(answer.pickedProject));
  });
}

function performAction(project) {

  var actions = [
    {
      name: 'Run',
      value: function () {
        con.log(`Running project "${project.name}"...`);
        console.log('running project', project);
        runProject(project);
      }
    },
    {
      name: 'Build production version',
      value: function () {
        con.log(`Building production version of project "${project.name}"...`);
        runProject(project, 'build');
      }
    },
    {
      name: 'Build and run production version',
      value: function () {
        con.log(`Running production version of project "${project.name}"...`);
        runProject(project, 'build:serve');
      }
    },
    {
      name: 'Deploy production version to surge.sh',
      value: function () {
        console.log('running project', project);
        runProject(project, 'deploy:surge');
      }
    },
    {
      name: 'Delete',
      value: function () {
        con.log(`Project "${project.name}" has been deleted`);
        gtbConfig.projects = _.filter(gtbConfig.projects, (p) => {
          return p.name !== project.name;
        });
        console.log('gtbConfig.projects', gtbConfig.projects);
        updateGtbConfig(true, gtbConfig);
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

  inq.prompt(prompt, function (answers) {
    answers.nextAction();
  });
}

function saveNewProject(newProject) {
  gtbConfig.projects.push(newProject);
  updateGtbConfig(true, gtbConfig);
}

function updateGtbConfig(displayListOfProjects, newConfig) {
  console.log('updating gtb config');
  var config = newConfig === undefined ? gtbConfig : newConfig;

  console.log('config is', config);
  writeFile(gtbConfigPath, config, {spaces: 2}, function (error) {
    if (error) {
      con.error(error);
      exit(-1);
    }

    if (displayListOfProjects === true) {
      listProjects();
    }
  });
}

function addNewProjectPrompt(project) {
  var pathExample = platformHelpers.getExamplePathByOs();
  var shouldAddTrailingSlash = false;

  var nameQuestion = {
    type: 'input',
    name: 'name',
    message: `What is the project name? (No spaces, max 20 characters)`,
    validate: function (name) {
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
  };

  var pathQuestion = {
    type: 'input',
    name: 'location',
    message: `What is full absolute path of the project? (i.e: ${pathExample})`,
    filter: function (path) {
      return shouldAddTrailingSlash ? (path + '/') : path;
    },
    validate: function (path) {

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

      var projectWithSamePath = _.find(gtbConfig.projects, function (project) {
        return project.location === path || project.location === (path + '/');
      });

      if (!_.isUndefined(projectWithSamePath)) {
        con.errorWithSpaces('Project with that path already exists, please choose another path!');
        return false;
      }

      //try to add a trailing slash to the path if the user forgot
      var lastCharacter = path[(path.length - 1)];
      if (lastCharacter !== '/') {
        path = path + '/';
        shouldAddTrailingSlash = true;
      }

      if (!existsSync(path)) {
        con.errorWithSpaces('The path of the project is not valid, please add a valid path!');
        return false
      }

      return true;
    }
  };

  inq.prompt([nameQuestion, pathQuestion], function (newProject) {
    console.log('newProject', newProject);
    saveNewProject(newProject);
  });
}

function runProject(project, task) {
  //initialize
  global.prefix = project.location;
  con.log(project.location);

  //write configs and gitignore
  writeGulpConfigFiles().then(function () {
    writeBowerConfig();
    fixGitIgnore();

    //gulp
    require('../tasks/all-gulp-tasks')();
    runSequence(task ? task : 'default');
  });
}
