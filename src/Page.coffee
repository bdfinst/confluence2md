class Page


  constructor: (fullPath, @formatter, @utils) ->
    @path = fullPath
    @init()


  init: () ->
    @fileName = @utils.getBasename @path
    @filePlainText = @utils.readFile @path
    @$ = @formatter.load @filePlainText
    @content = @$.root()
    @heading = @getHeading()
    @fileNameNew = @getFileNameNew()


  getFileNameNew: () ->
    return 'index.md' if @fileName == 'index.html'
    @heading.replace(/[\s\\/]/g, '_') + '.md'


  getHeading: () ->
    title = @content.find('title').text()
    if @fileName == 'index.html'
      title
    else
      indexName = @content.find('#breadcrumbs .first').text().trim()
      title.replace indexName + ' : ', ''


  ###*
  # Converts HTML file at given path to MD formatted text.
  # @return {string} Content of a file parsed to MD
  ###
  getTextToConvert: () ->
    content = @formatter.getRightContentByFileName @content, @fileName
    content = @formatter.fixHeadline content
    content = @formatter.fixIcon content
    content = @formatter.fixEmptyLink content
    content = @formatter.fixEmptyHeading content
    content = @formatter.fixPreformattedText content
    content = @formatter.fixImageWithinSpan content
    content = @formatter.fixArbitraryClasses content
    content = @formatter.fixAttachmentWraper content
    content = @formatter.fixPageLog content
    content = @formatter.fixLocalLinks content, @utils.getDirname @path
    content = @formatter.addPageHeading content, @heading
    @formatter.getHtml content


module.exports = Page
