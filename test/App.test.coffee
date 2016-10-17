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
    fullPath = _path.join __dirname, 'assets/page1'
    _rmdir 'assets/page1/Markdown', (error)->
    logger = new Logger Logger.DEBUG
    utils = new Utils _fs, _path, logger
    app = new App _fs, _exec, _path, _cheerio, _mkdirp, utils, logger
    app.convert fullPath

    _rmdir 'assets/page1/Markdown', (error)->
