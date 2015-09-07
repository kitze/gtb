module.exports = function (gulp, plugins) {
  
  var fs = require('fs');
  var getDir = require('../functions/get-dir');
  var con = require('../functions/console');

  return function () {
    con.hint("Processing rev ... ");

    var appJsRevManifest = JSON.parse(fs.readFileSync(getDir.build('rev/appjs/rev-manifest.json'), 'utf8'));
    var appCssRevManifest = JSON.parse(fs.readFileSync(getDir.build('rev/appcss/rev-manifest.json'), 'utf8'));
    var libJsRevManifest = JSON.parse(fs.readFileSync(getDir.build('rev/libjs/rev-manifest.json'), 'utf8'));
    var libCssRevManifest = JSON.parse(fs.readFileSync(getDir.build('rev/libcss/rev-manifest.json'), 'utf8'));
    var templatesRevManifest = JSON.parse(fs.readFileSync(getDir.build('rev/templates/rev-manifest.json'), 'utf8'));

    return gulp.src([getDir.build('index.html')])
      .pipe(plugins.replace('app.css', appCssRevManifest['app.css']))
      .pipe(plugins.replace('app.js', appJsRevManifest['app.js']))
      .pipe(plugins.replace('lib.css', libCssRevManifest['lib.css']))
      .pipe(plugins.replace('lib.js', libJsRevManifest['lib.js']))
      .pipe(plugins.replace('templates.js', templatesRevManifest['templates.js']))
      .pipe(gulp.dest(getDir.build('/')));
  }
};