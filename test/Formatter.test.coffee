require './init'


describe 'Formatter', ->

  it 'fixHeadline()', ->
    logger = new Logger Logger.WARNING
    formatter = new Formatter _cheerio, logger
    text = '<h1 id="CodingStandards-Odsadzovanieašírkakódu"><span class="mw-headline">Odsadzovanie a šírka kódu</span></h1>'
    $content = formatter.load text
    $content = formatter.fixHeadline $content
    assert.equal(
      formatter.getText $content
      'Odsadzovanie a šírka kódu'
    )

  it 'fixIcon()', ->
    logger = new Logger Logger.WARNING
    formatter = new Formatter _cheerio, logger
    text = '<div class="confluence-information-macro confluence-information-macro-information"><span class="aui-icon aui-icon-small aui-iconfont-info confluence-information-macro-icon"></span><div class="confluence-information-macro-body"><p>čitatelnosť kódu</p></div></div>'
    $content = formatter.load text
    assert.equal(
      $content.find('span.aui-icon').length
      1
    )
    $content = formatter.fixIcon $content
    assert.equal(
      formatter.getText $content
      'čitatelnosť kódu'
    )
    assert.equal(
      $content.find('span.aui-icon').length
      0
    )

