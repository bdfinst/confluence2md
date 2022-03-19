/* eslint-disable class-methods-use-this */
/* eslint-disable no-var */

'use strict'

const path = require('path')
const App = require('./App')

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Bootstrap {
  /**
   * @param {string} pathResource Directory with HTML files or one file. Can be nested.
   * @param {string|void} pathResult Directory where MD files will be generated to. Current dir will be used if none given.
   */
  run(pathResource, pathResult = '') {
    pathResource = path.resolve(pathResource)
    pathResult = path.resolve(pathResult)

    const app = new App()

    console.log(`Using source: ${pathResource}`)
    console.log(`Using destination: ${pathResult}`)

    return app.convert(pathResource, pathResult)
  }
}

module.exports = Bootstrap
