global.chai = require 'chai'
global.assert = chai.assert

global._fs = require 'fs'
global._exec = require 'sync-exec'
global._path = require 'path'
global._ncp = require 'ncp'
global._rmdir = require 'rimraf'
global._cheerio = require 'cheerio'
global._mkdirp = require 'mkdirp'

global.Logger = require '../src/Logger'
global.Utils = require '../src/Utils'
global.Formatter = require '../src/Formatter'
global.App = require '../src/App'
