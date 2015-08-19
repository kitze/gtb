module.exports = function (gulp, plugins, config) {
  var fs = require('fs');
  var dir = require('../../functions/dir')(config);
  var bdir = require('../../functions/build-dir')(config);
  var fileDir = require('../../functions/file-dir')(config);
  var con = require('../../functions/console');
  var handleError = require('../../functions/handle-error');

  return function () {
    con.hint("Processing rev ... ");

    var appJsRevManifest = JSON.parse(fs.readFileSync(bdir('rev/appjs/rev-manifest.json'), 'utf8'));
    var appCssRevManifest = JSON.parse(fs.readFileSync(bdir('rev/appcss/rev-manifest.json'), 'utf8'));

    var libJsRevManifest = JSON.parse(fs.readFileSync(bdir('rev/libjs/rev-manifest.json'), 'utf8'));
    var libCssRevManifest = JSON.parse(fs.readFileSync(bdir('rev/libcss/rev-manifest.json'), 'utf8'));

    console.log('rev manifest', appJsRevManifest, appCssRevManifest, libJsRevManifest, libCssRevManifest);
    return gulp.src([bdir('index.html')])
      .pipe(plugins.debug())
      .pipe(plugins.replace('app.css', appCssRevManifest['app.css']))
      .pipe(plugins.replace('app.js', appJsRevManifest['app.js']))
      .pipe(plugins.replace('lib.cs', libCssRevManifest['lib.css']))
      .pipe(plugins.replace('lib.js', libJsRevManifest['lib.js']))
      .pipe(gulp.dest(bdir('/')));
  }
};