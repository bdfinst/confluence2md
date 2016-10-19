require './init'


describe 'App', ->

  it 'testing run', ->
    pathResource = _path.join __dirname, 'assets'
    pathResult = _path.join __dirname, 'Markdown'
    _rmdir.sync pathResult, {'rmdirSync'}, (error)->
    logger = new Logger Logger.WARNING
    formatter = new Formatter _cheerio, logger
    utils = new Utils _fs, _path, logger
    app = new App _fs, _exec, _path, _mkdirp, utils, formatter, logger
    app.convert pathResource, pathResult
