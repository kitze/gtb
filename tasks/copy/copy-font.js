module.exports = function (gulp, plugins, config) {
  var fileDir = require('../../functions/file-dir')(config);
  var bdir = require('../../functions/build-dir')(config);

  return function (){
    var str = fileDir('*', 'font');
    console.log('str',str);
    gulp.src(str)
      .pipe(gulp.dest(bdir(config.dirs.font)));
  }
};