module.exports = function (gulp, plugins, config) {
  var _ = require('underscore');
  var dir = require('../../functions/dir')(config);
  var bdir = require('../../functions/build-dir')(config);
  var fileDir = require('../../functions/file-dir')(config);
  var jsDir = dir(config.dirs.js);

  return function () {
    var js = gulp.src([jsDir + 'plugins/*.js', jsDir + 'app.js'].concat(fileDir("js", "js"))).pipe(plugins.concat('app.js'));

    _(config.replacements).each(function (replacement) {
      js = js.pipe(plugins.replace(replacement[0], replacement[1]))
    });
    js.pipe(plugins.ngAnnotate())
      .pipe(plugins.if(global.isProduction, plugins.uglify()))
      .pipe(gulp.dest(bdir(config.dirs.js)))
      .pipe(plugins.connect.reload());
  }
};