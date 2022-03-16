/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var PageFactory = (function() {
  let Page = undefined;
  PageFactory = class PageFactory {
    static initClass() {
  
      Page = require('./Page');
    }


    constructor(formatter, utils) {
      this.formatter = formatter;
      this.utils = utils;
    }


    create(fullPath) {
      return new Page(fullPath, this.formatter, this.utils);
    }
  };
  PageFactory.initClass();
  return PageFactory;
})();


module.exports = PageFactory;
