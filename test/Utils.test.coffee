require './init'


describe 'Utils', ->

  it 'getAllHtmlFileNames() should return 5 file names for page1 directory', ->
    logger = new Logger Logger.WARNING
    utils = new Utils _fs, _path, logger
    fullPath = _path.join __dirname, 'assets/page1'
    actual = utils.getAllHtmlFileNames fullPath
    expected = [
      '9273380.html'
      'JavaScript_9273401.html'
      'My-article_9568346.html'
      'Webclient_9568537.html'
      'index.html'
    ]
    assert.sameMembers actual, expected
