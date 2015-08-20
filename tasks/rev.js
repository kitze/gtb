module.exports = function (gulp, plugins, config) {
  
  var fs = require('fs');
  var dir = require('../functions/dir')(config);
  var bdir = require('../functions/build-dir')(config);
  var con = require('../functions/console');

  return function () {
    con.hint("Processing rev ... ");

    var appJsRevManifest = JSON.parse(fs.readFileSync(bdir('rev/appjs/rev-manifest.json'), 'utf8'));
    var appCssRevManifest = JSON.parse(fs.readFileSync(bdir('rev/appcss/rev-manifest.json'), 'utf8'));
    var libJsRevManifest = JSON.parse(fs.readFileSync(bdir('rev/libjs/rev-manifest.json'), 'utf8'));
    var libCssRevManifest = JSON.parse(fs.readFileSync(bdir('rev/libcss/rev-manifest.json'), 'utf8'));
    var templatesRevManifest = JSON.parse(fs.readFileSync(bdir('rev/templates/rev-manifest.json'), 'utf8'));

    return gulp.src([bdir('index.html')])
      .pipe(plugins.replace('app.css', appCssRevManifest['app.css']))
      .pipe(plugins.replace('app.js', appJsRevManifest['app.js']))
      .pipe(plugins.replace('lib.css', libCssRevManifest['lib.css']))
      .pipe(plugins.replace('lib.js', libJsRevManifest['lib.js']))
      .pipe(plugins.replace('templates.js', templatesRevManifest['templates.js']))
      .pipe(gulp.dest(bdir('/')));
  }
};