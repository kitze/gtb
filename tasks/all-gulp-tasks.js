/* dependencies */
var gulp               = require('gulp'),
    fs                 = require('fs'),
    os                 = require('os'),
    _                  = require('underscore'),
    args               = require('yargs').argv,
    runSequence        = require('run-sequence'),
    plugins            = require('gulp-load-plugins')({config: '../../package.json'}),
    historyApiFallback = require('connect-history-api-fallback'),
    bdir               = require('../functions/build-dir'),
    con                = require('../functions/console');

var files = {
  GULP_CONFIG: global.prefix + "gulp-config.json",
  CUSTOM_CONFIG: global.prefix + "custom-gulp-config.json",
  GIT_IGNORE: global.prefix + ".gitignore"
};

var file = './projects.json';

var shouldGitIgnore = [
  "build/",
  "bower_components/",
  ".idea/",
  "custom-gulp-config.json",
  ".DS_STORE",
  "npm-debug.log"
];

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

var directories = {
  root: '/',
  app: 'app',
  build: 'build',
  css: 'css',
  js: 'js',
  templates: 'templates',
  images: 'img',
  custom: 'custom',
  fonts: 'fonts',
  font: 'font',
  json: 'json',
  bower: 'bower_components',
  scss: 'scss',
  zip: 'zip'
};

module.exports = function () {
  /* If a gulp config doesn't exist for the project generate one that will be global for the project */
  if (!fs.existsSync(files.GULP_CONFIG)) {
    fs.writeFileSync(files.GULP_CONFIG, JSON.stringify(gulpConfigTemplate));
  }

  /* If a custom gulp config doesn't exist generate one so every user can have his custom settings */
  if (!fs.existsSync(files.CUSTOM_CONFIG)) {
    fs.writeFileSync(files.CUSTOM_CONFIG, JSON.stringify(_(gulpConfigTemplate).omit(
      [
        'additionalBowerFiles',
        'imagesFolder',
        'copyToFolder'
      ]
    )));
  }

  var newGitIgnore;
  if (fs.existsSync(files.GIT_IGNORE)) {
    var currentGitIgnoreItems = fs.readFileSync(files.GIT_IGNORE, 'utf8').split(os.EOL);
    if (currentGitIgnoreItems.length !== undefined) {
      _(shouldGitIgnore).each(function (item) {
        if (currentGitIgnoreItems.indexOf(item) == -1) {
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

  fs.writeFileSync(files.GIT_IGNORE, _(newGitIgnore).compact().join(os.EOL));

  /* Get the default gulp config */
  var gulpConfig = JSON.parse(fs.readFileSync(files.GULP_CONFIG, 'utf8'));

  /* Merge the custom gulp config with the default one so every custom setting can be overriden */
  gulpConfig = _.extend(gulpConfig, JSON.parse(fs.readFileSync(files.CUSTOM_CONFIG, 'utf8')));

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

  /* Each of the gulp tasks that are in a separate file needs access to
   * the variables "gulp", "plugins" and "tasksConfig", so when a task is required
   * those 3 variables are supplied as arguments
   * */
  function addTask(folder, task, runBeforeTask) {
    var taskName = task ? (folder + ":" + task) : folder;
    var taskFolder = "/" + folder + (task ? "/" : '') + (task ? (folder + "-" + task) : (task ? folder : ''));
    gulp.task(taskName, runBeforeTask ? runBeforeTask : [], require("../tasks" + "/" + taskFolder)(gulp, plugins, tasksConfig));
  }

  function addTaskCombination(name, tasks) {
    gulp.task(name, function () {
      runSequence(getTaskGroup(name, tasks));
    });
  }

  function getTaskGroup(name, arr) {
    return _(arr).map(function (m) {
      return name + ":" + m
    });
  }

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

  /* Process */
  addTask('process', 'html');
  addTask('process', 'css');
  addTask('process', 'js');
  addTask('process', 'bower');
  addTask('process', 'fonts');
  addTask('process', 'images');
  addTaskCombination('process', ['html', 'css', 'js', 'bower', 'fonts', 'images']);

  /* Copies build folder to the directory defined in the "copyToFolder" property in gulp-config.json */
  addTask('copy', 'build');

  /* Copies json directory to build directory */
  addTask('copy', 'json');

  /* Run server that will serve index.html and the assets */
  addTask('server');

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

  /* Default task: Builds the app and runs the server without minifying or copying anything to a destination */
  gulp.task('default', function () {
    runSequence(['process', 'server', 'watch'])
  });
};
