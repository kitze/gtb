module.exports = function (gulp, plugins, config) {
  var _ = require('underscore');
  return function () {
    var js = gulp.src([config.dirs.src.js + 'plugins/*.js', config.dirs.src.js + 'app.js', config.dirs.src.js + '*.js', config.dirs.src.js + '**/*.js']).pipe(plugins.concat('app.js'));
    _(config.replacements).each(function (replacement) {js = js.pipe(plugins.replace(replacement[0], replacement[1]))});
    js.pipe(plugins.if(config.isProduction, plugins.ngAnnotate()))
      .pipe(plugins.if(config.isProduction, plugins.uglify()))
      .pipe(gulp.dest(config.dirs.build.js))
      .pipe(plugins.connect.reload());
  }
};