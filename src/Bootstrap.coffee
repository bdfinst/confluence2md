class Bootstrap

  _fs = require 'fs'
  _exec = require 'sync-exec'
  _path = require 'path'
  _cheerio = require 'cheerio'
  _mkdirp = require 'mkdirp'

  Utils = require './Utils'
  Logger = require './Logger'
  App = require './App'


  constructor: ->
    @paths =
      divePath: process.cwd()
      attachmentsExportPath: "/public/assets/images/"
      markdownImageReference: "assets/images/"


  run: ->
    @getPaths()
    logger = new Logger Logger.INFO
    utils = new Utils _fs, _path, logger
    app = new App _fs, _exec, _path, _cheerio, _mkdirp, utils, logger
    app.convert @paths.divePath


  getPaths: ->
    process.argv.forEach (val, index, array) =>
      if index == 2
        @paths.divePath = process.cwd() + @_path.sep + val
      else if index == 3
        @paths.attachmentsExportPath = val
      else if index == 4
        @paths.markdownImageReference = val

      true
    @paths


module.exports = Bootstrap
