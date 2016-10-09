chai = require 'chai'
expect = chai.expect
fs = require 'fs'
path = require 'path'
Logger = require '../src/Logger'
Utils = require '../src/Utils'


describe "feature", ->
  it "should add two numbers", ->
    expect 2 + 2
      .equal 4
  it "should substract two numbers", ->
    expect(2 - 2).equal 0


describe 'Utils', ->
  it 'getAllHtmlFileNames() should return 5 file names for page1 directory', ->
    logger = new Logger Logger.INFO
    utils = new Utils fs, path, logger
    fullPath = path.join __dirname, 'assets/page1'
    actual = utils.getAllHtmlFileNames fullPath
    expected = [
      '9273380.html'
      'JavaScript_9273401.html'
      'My-article_9568346.html'
      'Webclient_9568537.html'
      'index.html'
    ]
    expect actual
      .equal expected
