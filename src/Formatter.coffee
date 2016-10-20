class Formatter

  ###*
  # @param {cheerio} _cheerio Required lib
  # @param {Utils} utils My lib
  # @param {Logger} logger My lib
  ###
  constructor: (@_cheerio, @utils, @logger) ->


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
  # @param {cheerio obj} $content Content of a file
  # @return {string} HTML representation of a content
  ###
  getHtml: ($content) ->
    $ = @$
    contentHtml = ''
    $content.each (i, el) =>
      contentHtml += $(el).html()
    contentHtml


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
    else $('#main-content, .pageSection.group:has(.pageSectionHeader>#attachments)')


  ###*
  # Removes span inside of a h1 tag.
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixHeadline: ($content) ->
    $ = @$
    $content
      .find('span.mw-headline').each (i, el) =>
        $(el).replaceWith $(el).text()
      .end()


  ###*
  # Removes redundant icon
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixIcon: ($content) ->
    $ = @$
    $content
      .find('span.aui-icon').each (i, el) =>
        $(el).replaceWith $(el).text()
      .end()


  ###*
  # Removes empty link
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixEmptyLink: ($content) ->
    $ = @$
    $content
      .find('a').each (i, el) =>
        if (
          $(el).text().trim().length == 0 \
          and $(el).find('img').length == 0
        )
          $(el).remove()
      .end()


  ###*
  # Removes empty heading
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixEmptyHeading: ($content) ->
    $ = @$
    $content
      .find(':header').each (i, el) =>
        if $(el).text().trim().length == 0
          $(el).remove()
      .end()


  ###*
  # Gives the right class to syntaxhighlighter
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixPreformattedText: ($content) ->
    $ = @$
    $content
      .find('pre').each (i, el) =>
        data = $(el).data('syntaxhighlighterParams')
        $(el).attr('style', data)
        styles = $(el).css()
        brush = styles?.brush
        $(el).removeAttr 'class'
        $(el).addClass brush if brush
      .end()


  ###*
  # Fixes 'p > a > span > img' for which no image was created.
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixImageWithinSpan: ($content) ->
    $ = @$
    $content
      .find('span:has(img)').each (i, el) =>
        if $(el).text().trim().length == 0
          $(el).replaceWith($(el).html())
      .end()


  ###*
  # Removes arbitrary confluence classes.
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixArbitraryClasses: ($content) ->
    $ = @$
    $content
      .find('*').removeClass (i, e) ->
        (
          e.match(/(^|\s)(confluence\-\S+|external-link)/g) || []
        ).join ' '
      .end()


  fixAttachmentWraper: ($content) ->
    $ = @$
    $content
      .find('.attachment-buttons').remove().end() # action buttons for attachments
      .find('.plugin_attachments_upload_container').remove().end() # dropbox for uploading new files
      .find('table.attachments.aui').remove().end() # overview table with useless links


  ###*
  # Changes links to local HTML files to generated MD files.
  # @param {cheerio obj} $content Content of a file
  # @param {string} cwd Current working directory (where HTML files reside)
  # @return {cheerio obj} Cheerio object
  ###
  fixLocalLinks: ($content, cwd) ->
    $ = @$
    $content
      .find('a').each (i, el) =>
        href = $(el).attr 'href'
        if href == undefined
          text = $(el).text()
          $(el).replaceWith text
          @logger.debug 'No href for link with text "#{text}"'
        else if @utils.isFile href, cwd
          mdRelativeLink = href.replace '.html', '.md'
          $(el).attr 'href', mdRelativeLink
      .end()


  ###*
  # @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
  # @return {cheerio obj} Cheerio object
  ###
  createListFromArray: (itemArray) ->
    $ = @_cheerio.load '<ul>'
    $ul = $('ul')
    for item in itemArray
      $a = $('<a>').attr('href', item).text(item)
      $li = $('<li>')
      $li.append $a
      $ul.append $li
    $ul.end()


module.exports = Formatter
