require './init'


describe 'App', ->

  it 'testing run few', ->
    pathResource = _path.join __dirname, 'assets/few'
    pathResult = _path.join __dirname, 'few/Markdown'
    _rmdir.sync pathResult, {'rmdirSync'}, (error)->
    logger = new Logger Logger.WARNING
    formatter = new Formatter _cheerio, logger
    utils = new Utils _fs, _path, _ncp, logger
    app = new App _fs, _exec, _path, _mkdirp, utils, formatter, logger
    app.convert pathResource, pathResult


  it 'testing run all', ->
    pathResource = _path.join __dirname, 'assets/all'
    pathResult = _path.join __dirname, 'all/Markdown'
    _rmdir.sync pathResult, {'rmdirSync'}, (error)->
    logger = new Logger Logger.WARNING
    formatter = new Formatter _cheerio, logger
    utils = new Utils _fs, _path, _ncp, logger
    app = new App _fs, _exec, _path, _mkdirp, utils, formatter, logger
    app.convert pathResource, pathResult
