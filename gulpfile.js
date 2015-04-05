var gulp               = require('gulp'),
    fs                 = require('fs'),
    _                  = require('underscore'),
    args               = require('yargs').argv,
    runSequence        = require('run-sequence'),
    plugins            = require('gulp-load-plugins')(),
    bdir               = require('./functions/build-dir'),
    historyApiFallback = require('connect-history-api-fallback'),
    inq                = require('inquirer'),
    os                 = require('os'),
    figlet             = require('figlet');

require('shelljs/global');

figlet('WELCOME', function (err, data) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(data)
});

/* Flag that defines if the tasks should be performed in production mode */
global.isProduction = false;
global.currentProject = undefined;

/* If you add this repository as a submodule of any other app it will live in a folder inside of that app. So that's why the default
 * prefix is ".." and it's telling the gulp tasks where to look for your files (in this case, one folder backwards).
 * Another thing you can do is just pull this repository somewhere on your pc and if you want to run any app just add it's full path
 * to the prefix property, so you can have just one gulp folder on your pc that will run all of your apps.
 * */

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
    console.error('You don\'t have any projects so let\'s add your first one!');
    addNewProjectPrompt();
  }
}

function listOptions(project) {

  var projectNameExists = project !== undefined && project.name !== undefined;

  var C_NEW_PROJECT_WITH_NAME = projectNameExists ? ("Create a new project with name \"" + project.name + "\"") : "no_project",
      C_NEW_PROJECT           = "Create a new project",
      LIST_PROJECTS           = "List all my projects",
      SEARCH_PROJECTS         = "Search for projects in a directory";

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
    var projectsFileContent = fs.readFileSync('projects.json', 'utf8');
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
  fs.writeFileSync('projects.json', JSON.stringify(newContent));
  readProjects();
}

function addNewProjectPrompt(project) {
  var newProject = project === undefined ? {} : project;

  var nameQuestion = {
    type: "input",
    name: "name",
    message: "What is the project name?"
  };

  if (args.n !== undefined) {
    newProject.name = args.n;
    console.log("Your project name will be:", newProject.name);
  }

  var questions = [
    {
      type: "input",
      name: "location",
      message: "What is full absolute path of the project?"
    }
  ];

  if (args.n === undefined) {
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
  if (!fs.existsSync('projects.json')) {
    return undefined;
  }
  else {
    var projectsFileContent = fs.readFileSync('projects.json', 'utf8');
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
  if (projects !== undefined) {
    if (args.n === undefined) {
      listProjects();
    }
    else {
      var foundProject = _(projects).findWhere({name: args.n});
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
  console.log('Running project "' + project.name + '"...');
  global.prefix = project.location;
  addAllTasks();
  runSequence('default');
}

/* ================================= Task List  =========================== */

function addAllTasks() {

  var files = {
    GULP_CONFIG: "gulp-config.json",
    CUSTOM_CONFIG: "custom-gulp-config.json",
    GIT_IGNORE: ".gitignore"
  };

  var gulpConfigTemplate = {
    "serverPort": 9000,
    "openAfterLaunch": true,
    "copyToFolder": "copy",
    "imagesFolder": "img",
    "ignore": false,
    "liveReload": true,
    "additionalBowerFiles": {
      "js": [],
      "fonts": [],
      "sass": []
    },
    "ignoredFiles": {
      "js": [],
      "dependencies": []
    }
  };

  /* If a gulp config doesn't exist for the project generate one that will be global for the project */
  if (!fs.existsSync(global.prefix + files.GULP_CONFIG)) {
    fs.writeFileSync(global.prefix + files.GULP_CONFIG, JSON.stringify(gulpConfigTemplate));
  }

  /* If a custom gulp config doesn't exist generate one so every user can have his custom settings */
  if (!fs.existsSync(global.prefix + files.CUSTOM_CONFIG)) {
    fs.writeFileSync(global.prefix + files.CUSTOM_CONFIG, JSON.stringify(_(gulpConfigTemplate).omit(
      [
        'additionalBowerFiles',
        'imagesFolder'
      ]
    )));
  }

  var shouldGitIgnore = [
    "build/",
    "bower_components/",
    ".idea/",
    "custom-gulp-config.json",
    ".DS_STORE",
    "npm-debug.log"
  ];

  var newGitIgnore;
  if (fs.existsSync(global.prefix + files.GIT_IGNORE)) {
    var currentGitIgnoreItems = fs.readFileSync(global.prefix + files.GIT_IGNORE, 'utf8').split(os.EOL);
    if (currentGitIgnoreItems.length !== undefined) {
      _(shouldGitIgnore).each(function (item) {
        if (currentGitIgnoreItems.indexOf(item) == -1) {
          console.log('to add -->', item);
          currentGitIgnoreItems.push(item);
        }
      });
      newGitIgnore = currentGitIgnoreItems;
    }
  }
  else {
    console.log('.gitignore doesnt exist, writing it');
    newGitIgnore = shouldGitIgnore;
  }

  fs.writeFileSync(global.prefix + files.GIT_IGNORE, _(newGitIgnore).compact().join(os.EOL));

  /* Get the default gulp config */
  var gulpConfig = JSON.parse(fs.readFileSync(global.prefix + files.GULP_CONFIG, 'utf8'));

  /* Merge the custom gulp config with the default one so every custom setting can be overriden */
  gulpConfig = _.extend(gulpConfig, JSON.parse(fs.readFileSync(global.prefix + files.CUSTOM_CONFIG, 'utf8')));

  /* If the project is an angular project the dependencies should be specified in the gulp config so if the user wants some of the
   * dependencies to be ignored just on his machine he can specify that in the gulpConfig.ignoredFiles.dependencies property.
   */
  var dependencies = _(gulpConfig.dependencies).filter(function (dependency) {
    return global.isProduction === true || gulpConfig.ignore !== true || gulpConfig.ignoredFiles.dependencies.indexOf(dependency) === -1;
  });

  /* In the replacements array you can add any key:value that later will be replaced in every of the html and js files
   * So for example if your app needs access to the port the app is running on and you have the port define in your gulpfile you can access
   * it easily from your html/js.
   */
  var replacements = [
    ["G_SERVER_PORT", gulpConfig.serverPort],
    ["G_DEPENDENCIES", JSON.stringify(dependencies)]
  ];

  /* ================================= Task Loader Functions  =========================== */

  /* Each of the tasks that are in a separate file needs access to
   * the variables "gulp", "plugins" and "tasksConfig", so when a tasks is required
   * those 3 are supplied as arguments
   * */
  function addTask(folder, task, runBeforeTask) {
    var taskName = task ? (folder + ":" + task) : folder;
    var taskFolder = "/" + folder + (task ? "/" : '') + (task ? (folder + "-" + task) : (task ? folder : ''));
    gulp.task(taskName, runBeforeTask ? runBeforeTask : [], require(directories.tasks + "/" + taskFolder)(gulp, plugins, tasksConfig));
  }

  function addTaskCombination(name, arr, runBeforeTask) {
    runBeforeTask = runBeforeTask ? runBeforeTask : [];
    gulp.task(name, runBeforeTask.concat(_(arr).map(function (m) {
      return name + ":" + m
    })));
  }

  var directories = {
    root: '/',
    app: 'app',
    build: 'build',
    css: 'css',
    js: 'js',
    templates: 'templates',
    images: gulpConfig.imagesFolder,
    custom: 'custom',
    fonts: 'fonts',
    font: 'font',
    json: 'json',
    bower: 'bower_components',
    scss: 'scss',
    zip: 'zip',
    tasks: './tasks'
  };

  var settings = {
    /* Settings for the node server that will serve our index.html and assets */
    server: {
      "host": 'localhost',
      "livereload": gulpConfig.liveReload,  // Tip: disable livereload if you're using older versions of internet explorer because it doesn't work
      "middleware": function () {
        return [historyApiFallback];
      },
      port: gulpConfig.serverPort
    }
  };

  var tasksConfig = {
    gulp: gulpConfig,
    server: settings.server,
    bower: settings.bower,
    dirs: directories,
    replacements: replacements,
    args: args
  };

  /* Clean */
  addTask('clean', 'build');
  addTask('clean', 'zip');

  /* Compile */
  addTask('compile', 'coffee');
  addTask('compile', 'jade');
  addTask('compile', 'sass');

  /* Concat */
  addTask('concat', 'js');
  addTask('concat', 'bower');
  addTaskCombination('concat', ['bower', 'js'], ['compile:sass']);

  /* Copy */
  addTask('copy', 'build');
  addTask('copy', 'font');
  addTask('copy', 'fonts');
  addTask('copy', 'html', ['compile:jade']);
  addTask('copy', 'htmlroot');
  addTask('copy', 'images', ['imagemin']);
  addTask('copy', 'json');
  addTaskCombination('copy', ['html', 'images', 'json', 'fonts', 'font', 'htmlroot'], ['clean:build', 'concat:bower']);

  /* Run server that will serve index.html and the assets */
  addTask('server');

  /* Minify images */
  addTask('imagemin');

  /* Build the app and put the 'build' folder in a zip file */
  addTask('zip');

  /* Watch the directories for changes and reload the page, or if a scss/css file is changed inject it automatically without refreshing */
  addTask('watch');

  /* Delete build folder, copy, minify, annotate everything, then copy it to the destination folder */
  addTask('build', 'copy');

  /* Just build the project in production mode, don't run anything else */
  addTask('build', 'only');

  /* Just build the project in normal non-production mode, don't run anything else */
  addTask('build', 'normal');

  /* Run the built & minified site in production mode without hashing anything and copying to the destination folder */
  addTask('build', 'prod');

  /* Print all the gulp tasks */
  gulp.task('tasks', plugins.taskListing);

  /* Default task: Builds the app and runs the server without minifying or copying anything to a destination */
  gulp.task('default', ['copy', 'concat', 'server', 'watch']);
}

function wait(fn) {
  setTimeout(function () {
    fn();
  }, 500);
}

/* Runs project with name */
gulp.task('run', function () {
  wait(function () {
    if (args.n === undefined) {
      console.log('If you want you can directly specify a project name with the -n parameter!');
      listProjects();
    }
    else {
      readProjects();
    }
  });
});

/* Lists all projects */
gulp.task('projects', function () {
  wait(listProjects);
});

gulp.task('default', function () {
  wait(listOptions);
});