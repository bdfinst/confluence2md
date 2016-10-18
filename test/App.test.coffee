chai = require 'chai'
assert = chai.assert

_fs = require 'fs'
_exec = require 'sync-exec'
_path = require 'path'
_rmdir = require 'rimraf'
_cheerio = require 'cheerio'
_mkdirp = require 'mkdirp'

Logger = require '../src/Logger'
Utils = require '../src/Utils'
App = require '../src/App'


describe 'App', ->

  it 'testing run', ->
    pathResource = _path.join __dirname, 'assets'
    pathResult = _path.join __dirname, 'Markdown'
    _rmdir.sync pathResult, {'rmdirSync'}, (error)->
    logger = new Logger Logger.WARNING
    utils = new Utils _fs, _path, logger
    app = new App _fs, _exec, _path, _cheerio, _mkdirp, utils, logger
    app.convert pathResource, pathResult
