/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Bootstrap = (function () {
  let _fs
  let _exec
  let _path
  let _ncp
  let _cheerio
  let _mkdirp
  let Utils
  let Logger
  let Formatter
  let App
  let PageFactory
  Bootstrap = class Bootstrap {
    static initClass() {
      _fs = require('fs')
      _exec = require('sync-exec')
      _path = require('path')
      _ncp = require('ncp')
      _cheerio = require('cheerio')
      _mkdirp = require('mkdirp')

      Utils = require('./Utils')
      Logger = require('./Logger')
      Formatter = require('./Formatter')
      App = require('./App')
      PageFactory = require('./PageFactory')
    }

    /**
     * @param {string} pathResource Directory with HTML files or one file. Can be nested.
     * @param {string|void} pathResult Directory where MD files will be generated to. Current dir will be used if none given.
     */
    run(pathResource, pathResult) {
      if (pathResult == null) {
        pathResult = ''
      }
      pathResource = _path.resolve(pathResource)
      pathResult = _path.resolve(pathResult)

      const logger = new Logger(Logger.INFO)
      const utils = new Utils(_fs, _path, _ncp, logger)
      const formatter = new Formatter(_cheerio, utils, logger)
      const pageFactory = new PageFactory(formatter, utils)
      const app = new App(
        _fs,
        _exec,
        _path,
        _mkdirp,
        utils,
        formatter,
        pageFactory,
        logger,
      )

      logger.info(`Using source: ${pathResource}`)
      logger.info(`Using destination: ${pathResult}`)

      return app.convert(pathResource, pathResult)
    }
  }
  Bootstrap.initClass()
  return Bootstrap
})()

module.exports = Bootstrap
