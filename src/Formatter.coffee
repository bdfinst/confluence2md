class Formatter


  ###*
  # @param {cheerio} _cheerio Required lib
  # @param {Logger} logger My lib
  ###
  constructor: (@_cheerio, @logger) ->


  ###*
  # @param {string} fileText Content of a file
  ###
  load: (fileText) ->
    @$ = @_cheerio.load fileText


  ###*
  # @param {string} fileName Name of a file
  ###
  getContent: (fileName) ->
    $ = @$
    if fileName == 'index.html'
    then $('#content')
    else $('#main-content')


  ###*
  # @param {cheerio obj} content Content of a file
  ###
  fixHeadline: (content) ->
    $ = @$
    content
      .find('span.mw-headline').each (i, el) ->
        $(this).replaceWith $(this).text()
      .end()


  ###*
  # @param {cheerio obj} content Content of a file
  ###
  fixIcon: (content) ->
    $ = @$
    content
      .find('span.aui-icon').each (i, el) ->
        $(this).replaceWith $(this).text()
      .end()


  ###*
  # @param {cheerio obj} content Content of a file
  ###
#  fixLinks: (content) ->
#    $ = content
#    text = $('a').each (i, el) =>
#      oldLink = $(this).attr 'href'
#      if oldLink in HTML_FILE_LIST
#        newLink = @_path.basename(oldLink, '.html') + '.md'
#        $(this).attr 'href', newLink
#    .end()
#    .html()
#
#    text


module.exports = Formatter
