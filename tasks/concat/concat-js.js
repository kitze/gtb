module.exports = function (gulp, plugins, config) {
  var _ = require('underscore');
  var dir = require('../../functions/dir')(config.dirs);

  var jsDir = dir(config.dirs.src.js);
  console.log('jsDir',jsDir);

  return function () {
    var js = gulp.src([jsDir + 'plugins/*.js', jsDir + 'app.js', jsDir + '*.js', jsDir + '**/*.js']).pipe(plugins.concat('app.js'));
    _(config.replacements).each(function (replacement) {js = js.pipe(plugins.replace(replacement[0], replacement[1]))});
    js.pipe(plugins.if(config.isProduction, plugins.ngAnnotate()))
      .pipe(plugins.if(config.isProduction, plugins.uglify()))
      .pipe(gulp.dest(config.dirs.build.js))
      .pipe(plugins.connect.reload());
  }
};