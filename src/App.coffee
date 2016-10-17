class App

  ###*
  # htmlFileList list of files with .html extension (original files)
  ###
  HTML_FILE_LIST = [];

  ###*
  # @param {fs} _fs Required lib
  # @param {sync-exec} _exec Required lib
  # @param {path} _path Required lib
  # @param {cheerio} _cheerio Required lib
  # @param {Utils} utils My lib
  # @param {Logger} logger My lib
  ###
  constructor: (@_fs, @_exec, @_path, @_cheerio, @utils, @logger) ->
    @options =
      pandocOutputType: "markdown_github+blank_before_header"
      pandocOptions: "--atx-headers"


  convert: (dir) ->
    HTML_FILE_LIST = @utils.getAllHtmlFileNames dir
    @dive dir


  dive: (dir) ->
    @logger.info "Reading the directory: " + dir
    list = @_fs.readdirSync dir
    list.forEach (file) =>
      fullPath = dir + "/" + file
      fileStat = @_fs.statSync fullPath

      if fileStat && fileStat.isDirectory()
        @dive fullPath
      else
        if not file.endsWith '.html'
          @logger.debug 'Skipping non-html file: ' + file
          return
        @parseFile fullPath


  parseFile: (fullPath) ->
    @logger.info 'Parsing file: ' + fullPath
    text = @prepareContent fullPath
    extName = @_path.extname fullPath
    markdownFileName = @_path.basename(fullPath, extName) + '.md'

    @logger.info "Making Markdown ..."
    outputFile = @writeMarkdownFile text, markdownFileName
    @logger.info "done"


  writeMarkdownFile: (text, markdownFileName) ->
    @utils.mkdirpSync "/Markdown"
    outputFileName = "Markdown/" + markdownFileName
    inputFile = outputFileName + "~"
    @_fs.writeFileSync inputFile, text
    command =
      "pandoc -f html -t " +
        @options.pandocOutputType + " " +
        @options.pandocOptions +
        " -o " + outputFileName +
        " " + inputFile
    out = @_exec command, {cwd: process.cwd()}
    @_fs.unlink inputFile

    outputFileName


  prepareContent: (fullPath) ->
    fileText = @_fs.readFileSync fullPath, 'utf8'
    $ = @_cheerio.load fileText
    $content =
      if @_path.basename(fullPath) == 'index.html'
      then $('#content')
      else $('#main-content')
    content = $content
      .find('span.mw-headline').each (i, el) ->
        $(this).replaceWith $(this).text()
      .end()
      .find('span.aui-icon').each (i, el) ->
        $(this).replaceWith $(this).text()
      .end()
      .html();
#    content = @fixLinks content

#    @logger.info "Relinking images ..."
#    @relinkImagesInFile outputFile, attachmentsExportPath, markdownImageReference #TODO attributes
#    @logger.info "done"

    content


  fixLinks: (content) ->
    $ = @_cheerio.load content
    text = $('a').each (i, el) =>
      oldLink = $(this).attr 'href'
      if oldLink in HTML_FILE_LIST
        newLink = @_path.basename(oldLink, '.html') + '.md'
        $(this).attr 'href', newLink
    .end()
    .html()

    text


  ###*
  # TODO
  ###
  relinkImagesInFile: (outputFile, attachmentsExportPath, markdownImageReference) ->
    text = @_fs.readFileSync outputFile, 'utf8'
    matches = @utils.uniq(
      text.match(/(<img src=")([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)/ig)
    )
    dir = '' ## TODO parent directory of outputFile
    matches.forEach (imgTag) =>
      imgTag = imgTag.replace '<img src="', ''
      attachments = imgTag.replace "attachments/", ""
      if attachments == imgTag
        return
      fileName = attachmentsExportPath + attachments
      @logger.info "Creating image dir: " + fileName.substr(0, fileName.lastIndexOf('/'))
      @utils.mkdirpSync fileName.substr(0, fileName.lastIndexOf('/'))
      @logger.info "Creating filename: " + fileName
      try
        @_fs.accessSync dir + "/" + imgTag, @_fs.F_OK
        @_fs.createReadStream dir + "/" + imgTag
          .pipe(
            @_fs.createWriteStream(
              process.cwd() + "/" + fileName
            )
          )
        @logger.info "Wrote: " + dir + "/" + imgTag + "\n To: " + process.cwd() + "/" + fileName
      catch e
        @logger.error "Can't read: " + dir + "/" + imgTag
    lines = text.replace(
      /(<img src=")([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)\/([a-z||_|0-9|.|]+)/ig,
      "$1" + markdownImageReference + "$3/$4"
    )

    @_fs.writeFileSync outputFile, lines


module.exports = App
