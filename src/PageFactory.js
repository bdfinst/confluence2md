/* eslint-disable no-var */

'use strict'

const Page = require('./Page')

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class PageFactory {
  create(fullPath) {
    this.fullPath = fullPath
    return new Page(this.fullPath)
  }
}

module.exports = PageFactory
