class Bootstrap

  fs = require 'fs'
  exec = require 'sync-exec'
  path = require 'path'
  cheerio = require 'cheerio'
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
    utils = new Utils fs, path, logger
    app = new App fs, exec, path, cheerio, utils, logger
    app.convert @paths.divePath


  getPaths: ->
    process.argv.forEach (val, index, array) =>
      if index == 2
        @paths.divePath = process.cwd() + "/" + val
      else if index == 3
        @paths.attachmentsExportPath = val
      else if index == 4
        @paths.markdownImageReference = val

      true
    @paths


module.exports = Bootstrap
