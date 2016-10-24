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
    @_cheerio.load text


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
    $ = @_cheerio
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
  getRightContentByFileName: ($content, fileName) ->
    if fileName == 'index.html'
      $content.find('#content')
        .find('#main-content>.confluenceTable').remove().end() # Removes arbitrary table located on top of index page
    else
      $content.find('#main-content, .pageSection.group:has(.pageSectionHeader>#attachments)')


  ###*
  # Removes span inside of a h1 tag.
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixHeadline: ($content) ->
    $ = @_cheerio
    $content
      .find('span.mw-headline').each (i, el) =>
        $(el).replaceWith $(el).text()
      .end()


  addPageHeading: ($content, headingText) ->
    $ = @_cheerio
    h1 = $('<h1>').text headingText
    $content.prepend h1


  ###*
  # Removes redundant icon
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixIcon: ($content) ->
    $ = @_cheerio
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
    $ = @_cheerio
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
    $ = @_cheerio
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
    $ = @_cheerio
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
    $ = @_cheerio
    $content
      .find('span:has(img)').each (i, el) =>
        if $(el).text().trim().length == 0
          $(el).replaceWith($(el).html())
      .end()


  removeArbitraryElements: ($content) ->
    $ = @_cheerio
    $content
      .find('span').each (i, el) =>
        $(el).replaceWith $(el).text()
      .end()


  ###*
  # Removes arbitrary confluence classes.
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixArbitraryClasses: ($content) ->
    $content
      .find('*').removeClass (i, e) ->
        (
          e.match(/(^|\s)(confluence\-\S+|external-link|uri|tablesorter-header-inner|odd|even|header)/g) || []
        ).join ' '
      .end()


  ###*
  # Removes arbitrary confluence elements for attachments.
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixAttachmentWraper: ($content) ->
    $content
      .find('.attachment-buttons').remove().end() # action buttons for attachments
      .find('.plugin_attachments_upload_container').remove().end() # dropbox for uploading new files
      .find('table.attachments.aui').remove().end() # overview table with useless links


  ###*
  # Removes arbitrary confluence elements for page log.
  # @param {cheerio obj} $content Content of a file
  # @return {cheerio obj} Cheerio object
  ###
  fixPageLog: ($content) ->
    $content
      .find('[id$="Recentspaceactivity"], [id$=Spacecontributors]').parent().remove()
      .end().end()


  ###*
  # Changes links to local HTML files to generated MD files.
  # @param {cheerio obj} $content Content of a file
  # @param {string} cwd Current working directory (where HTML file reside)
  # @return {cheerio obj} Cheerio object
  ###
  fixLocalLinks: ($content, space, pages) ->
    $ = @_cheerio
    $content
      .find('a').each (i, el) =>
        href = $(el).attr 'href'
        if href == undefined
          text = $(el).text()
          $(el).replaceWith text
          @logger.debug 'No href for link with text "#{text}"'
        else if $(el).hasClass 'createlink'
          $(el).replaceWith $(el).text()
        else if pageLink = @utils.getLinkToNewPageFile href, pages, space
          $(el).attr 'href', pageLink
      .end()


  ###*
  # @param {array} indexHtmlFiles Relative paths of index.html files from all parsed Confluence spaces
  # @return {cheerio obj} Cheerio object
  ###
  createListFromArray: (itemArray) ->
    $ = @_cheerio.load '<ul>'
    $ul = $('ul')
    for item in itemArray
      $a = $('<a>').attr('href', item).text item.replace '/index', ''
      $li = $('<li>')
      $li.append $a
      $ul.append $li
    $ul.end()


module.exports = Formatter
