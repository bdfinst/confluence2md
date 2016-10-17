chai = require 'chai'
assert = chai.assert

_fs = require 'fs'
_exec = require 'sync-exec'
_path = require 'path'
_cheerio = require 'cheerio'

Logger = require '../src/Logger'
Utils = require '../src/Utils'
App = require '../src/App'


describe 'App', ->

  it 'someting', ->
    assert.equal 5, 5

  it 'testing run', ->
    fullPath = _path.join __dirname, 'assets/page1'
    logger = new Logger Logger.INFO
    utils = new Utils _fs, _path, logger
    app = new App _fs, _exec, _path, _cheerio, utils, logger
    app.convert fullPath

