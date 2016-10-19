class Formatter


  ###*
  # @param {cheerio} _cheerio Required lib
  # @param {Logger} logger My lib
  ###
  constructor: (@_cheerio, @logger) ->


  ###*
  # @param {string} text Content of a file
  # @return {cheerio obj} Root object of a text
  ###
  load: (text) ->
    @$ = @_cheerio.load text
    @$.root()


  ###*
  # @return {cheerio obj} Cheerio object
  ###
  getDollar: ->
    @$


  ###*
  # @param {cheerio obj} $content Content of a file
  # @return {string} Textual representation of a content
  ###
  getText: ($content) ->
    $content.text()


  ###*
  # The right content is selected based on the filename given.
  # Actual content of a page is placed elsewhere for index.html and other pages.
  # @see load() You need to load the content first.
  # @param {string} fileName Name of a file
  ###
  getRightContentByFileName: (fileName) ->
    $ = @$
    if fileName == 'index.html'
    then $('#content')
    else $('#main-content')


  ###*
  # Removes span inside of a h1 tag.
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixHeadline: ($content) ->
    $ = @$
    $content
      .find('span.mw-headline').each (i, el) ->
        $(this).replaceWith $(this).text()
      .end()


  ###*
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixIcon: ($content) ->
    $ = @$
    $content
      .find('span.aui-icon').each (i, el) ->
        $(this).replaceWith $(this).text()
      .end()


  ###*
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
#  fixLinks: ($content) ->
#    $ = $content
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
