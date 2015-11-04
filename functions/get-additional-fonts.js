module.exports = function () {

  var _ = require('lodash');

  var bowerFontTemplates = {
    bootstrap: {
      name: "bootstrap",
      directory: "fonts",
      escapeUrl: /glyphicons/
    },
    fontAwesome: {
      name: "fontawesome",
      directory: "fonts",
      escapeUrl: /fontawesome/
    },
    ionicons: {
      name: "ionic",
      directory: "release/fonts",
      escapeUrl: /ionicons/
    }
  };

  return function (bowerFiles) {
    var additionalFonts = [];
    _.each(bowerFiles, function (file) {
      _.each(bowerFontTemplates, function (template) {
        if (file.indexOf(template.name) !== -1 && template.added !== true) {
          additionalFonts.push(template);
          template.added = true;
        }
      });
    });
    return additionalFonts;
  }
};