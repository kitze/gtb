#! /usr/bin/env node
/* global shell */
require('shelljs/global');
/* dependencies */
var fs                   = require('fs'),
    _                    = require('underscore'),
    args                 = require('yargs').argv,
    runSequence          = require('run-sequence'),
    inq                  = require('inquirer'),
    chalk                = require('chalk'),
    figlet               = require('figlet'),
    con                  = require('./functions/console'),
    writeGulpConfigFiles = require('./functions/write-gulp-config-files'),
    writeBowerConfig     = require('./functions/write-bower-config'),
    fixGitIgnore         = require('./functions/fix-git-ignore');

var gtbMethods = {
  run: function () {
    if (projectNameFromArguments() === undefined) {
      con.hint('If you want you can directly specify a project name with the -n parameter!');
      listProjects();
    }
    else {
      readProjects();
    }
  },
  projects: function () {
    listProjects();
  }
};

var usersHome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var projectsJsonDirectory = usersHome + "/projects.json";

global.isProduction = false;
global.currentProject = undefined;

/* Welcome: show GTB ascii art then show whatever is next */
figlet('GTB', function (err, asciiArt) {
  if (err) {
    console.log(err);
    return;
  }

  console.log(chalk.bold.green('-> Gulp the Builder <-\n'));

  var findMethod = gtbMethods[args._[0]];
  if (findMethod) {
    findMethod();
  }
  else if (args._[0] === ".") {
    gtbMethods.run();
  }
  else {
    listOptions();
  }

});

function listProjects() {
  var projectsFile = getProjectsFile();

  if (projectsFile !== undefined && projectsFile.length !== 0) {

    /* If there's only run project run that one by default */
    if (projectsFile.length === 1) {
      runProject(projectsFile[0]);
    }
    /* If there are more projects pick which one to run */
    else {
      var projectList = _(projectsFile).map(function (p) {
        return p.name;
      });
      inq.prompt({
        type: "list",
        name: "projectToRun",
        message: "Pick which project would you like to run?",
        choices: projectList
      }, function (answers) {
        var foundProject = _(projectsFile).findWhere({name: answers.projectToRun});
        runProject(foundProject);
      });
    }
  }
  else {
    con.err('You don\'t have any projects so let\'s add your first one!');
    addNewProjectPrompt();
  }
}

function listOptions(project) {

  var projectNameExists = project !== undefined && project.name !== undefined;

  var C_NEW_PROJECT_WITH_NAME = projectNameExists ? ("Create a new project with name \"" + project.name + "\"") : "no_project",
      C_NEW_PROJECT           = "Create a new project",
      LIST_PROJECTS           = "List all my projects";
  var choiceMessage = projectNameExists ?
    "A project with that name doesn\'t exist in your projects.json file. What do you want to do?"
    : "What do you want to do?";

  var choices = [
    projectNameExists === false ? C_NEW_PROJECT : C_NEW_PROJECT_WITH_NAME,
    LIST_PROJECTS
  ];

  var prompt = [{
    type: "list",
    name: "nextAction",
    message: choiceMessage,
    choices: choices
  }];

  inq.prompt(prompt, function (answers) {
    if (answers.nextAction === C_NEW_PROJECT) {
      addNewProjectPrompt();
    }
    if (answers.nextAction === C_NEW_PROJECT_WITH_NAME) {
      addNewProjectPrompt(project);
    }
    else if (answers.nextAction === LIST_PROJECTS) {
      listProjects();
    }
  });
}

function saveNewProject(newProject) {
  var projectsFile = getProjectsFile();

  var newContent;
  if (projectsFile === undefined) {
    console.log('projects.json doesn\'t exist, creating it for the first time');
    newContent = [newProject];
  }
  else {
    console.log('projects.json exists, checking if empty');
    var projectsFileContent = fs.readFileSync(projectsJsonDirectory, 'utf8');
    var projects;
    /* If the projects.json exists, but the content is empty */
    if (projectsFileContent.trim() === "") {
      console.log('projects.json content is empty');
      newContent = [newProject];
    }
    else {
      projects = JSON.parse(projectsFileContent);
      projects.push(newProject);
      newContent = projects;
    }
  }
  fs.writeFileSync(projectsJsonDirectory, JSON.stringify(newContent));
  readProjects();
}

function currentProcessPath() {
  return process.cwd() + "/";
}

function projectNameFromArguments() {
  return args._[0] === "." ? {name: "current", location: currentProcessPath()} : (args.n === true ? undefined : args.n);
}

function addNewProjectPrompt(project) {
  var newProject = project === undefined ? {} : project;

  var nameQuestion = {
    type: "input",
    name: "name",
    message: "What is the project name?"
  };

  if (projectNameFromArguments() !== undefined) {
    newProject.name = projectNameFromArguments();
    console.log("Your project name will be:", newProject.name);
  }

  var questions = [
    {
      type: "input",
      name: "location",
      message: "What is full absolute path of the project?"
    }
  ];

  if (projectNameFromArguments() === undefined) {
    questions.unshift(nameQuestion);
  }

  inq.prompt(questions, function (answers) {
    saveNewProject(_(newProject).extend(answers));
  });
}

function invalidProjectsJsonMessage() {
  console.log('projects.json is not a valid json file, please check it for errors!');
  exit(-1);
}

function getProjectsFile() {
  /* If projects.json doesn't exist prompt to add the first project */
  if (!fs.existsSync(projectsJsonDirectory)) {
    return undefined;
  }
  else {
    var projectsFileContent = fs.readFileSync(projectsJsonDirectory, 'utf8');
    var returnProjects;
    if (projectsFileContent.trim() === "") {
      returnProjects = [];
    }
    else {
      try {
        returnProjects = JSON.parse(projectsFileContent);
        if (returnProjects.length === undefined) {
          invalidProjectsJsonMessage();
        }
      } catch (exception) {
        invalidProjectsJsonMessage();
      }
    }
    return returnProjects;
  }
}

function readProjects() {
  /* If it exists run the project, if it's not there prompt to add new project */
  var projects = getProjectsFile();
  var projectName = projectNameFromArguments();
  if (projects !== undefined || (projectName !== undefined && projectName.name === "current")) {
    if (projectName === undefined) {
      listProjects();
    }
    else {
      var foundProject;
      var argumentsProject = projectName;
      if (argumentsProject.name === "current") {
        foundProject = argumentsProject;
      }
      else {
        foundProject = _(projects).findWhere({name: argumentsProject});
      }

      /* if argument exists, run specific project */
      if (foundProject !== undefined) {
        runProject(foundProject);
      }
      else {
        addNewProjectPrompt();
      }
    }
  }
  else {
    addNewProjectPrompt();
  }
}

function runProject(project) {
  con.hint('Running project "' + project.name + '"...');
  global.prefix = project.location;
  con.log(global.prefix);
  writeGulpConfigFiles();
  writeBowerConfig();
  fixGitIgnore();
  require('./tasks/all-gulp-tasks')();
  runSequence(args.c ? args.c : 'default');
}