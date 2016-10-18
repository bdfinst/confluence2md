class App

  ###*
  # htmlFileList list of files with .html extension (original files)
  ###
#  HTML_FILE_LIST = [];

  ###*
  # @param {fs} _fs Required lib
  # @param {sync-exec} _exec Required lib
  # @param {path} _path Required lib
  # @param {cheerio} _cheerio Required lib
  # @param {mkdirp} _mkdirp Required lib
  # @param {Utils} utils My lib
  # @param {Logger} logger My lib
  ###
  constructor: (@_fs, @_exec, @_path, @_cheerio, @_mkdirp, @utils, @logger) ->
    @options =
      pandocOutputType: "markdown_github+blank_before_header"
      pandocOptions: "--atx-headers"


  ###*
  # Converts HTML files to MD files.
  # @param {string} dirIn Directory to go through
  # @param {string} dirOut Directory where to place converted MD files
  ###
  convert: (@dirIn, @dirOut) ->
#    HTML_FILE_LIST = @utils.getAllHtmlFileNames dir
    @dive @dirIn, @dirOut


  ###*
  # Iterates through whole dir structure and converts found files.
  # @param {string} dirIn Directory to go through
  # @param {string} dirOut Directory where to place converted MD files
  ###
  dive: (dirIn, dirOut) ->
    @logger.info "Reading the directory: " + dirIn
    list = @_fs.readdirSync dirIn
    list.forEach (file) =>
      fullPath = @_path.join dirIn, file
      fileStat = @_fs.statSync fullPath

      if fileStat && fileStat.isDirectory()
        @dive fullPath, @_path.join dirOut, file
      else
        if not file.endsWith '.html'
          @logger.debug 'Skipping non-html file: ' + file
          return
        @convertFile fullPath, dirOut


  ###*
  # Converts HTML file at given path to MD.
  # @param {string} fullInPath Absolute path to file to convert
  # @param {string} dirOut Directory where to place converted MD files
  ###
  convertFile: (fullInPath, dirOut) ->
    @logger.info 'Parsing file: ' + fullInPath
    text = @prepareContent fullInPath
    extName = @_path.extname fullInPath
    fullOutFileName = @_path.join dirOut, @_path.basename(fullInPath, extName) + '.md'

    @logger.info 'Making Markdown ...'
    @writeMarkdownFile text, fullOutFileName
    @logger.info 'done ' + fullOutFileName


  ###*
  # @param {string} text Makdown content of file
  # @param {string} fullOutFileName Absolute path to resulting file
  # @return {string} Absolute path to created MD file
  ###
  writeMarkdownFile: (text, fullOutFileName) ->
    fullOutDirName = @_path.dirname fullOutFileName
    @_mkdirp.sync fullOutDirName, (error) ->
      if error
        @logger.error 'Unable to create directory #{fullOutDirName}'

    tempInputFile = fullOutFileName + '~'
    @_fs.writeFileSync tempInputFile, text, flag: 'w'
    command =
      'pandoc -f html -t ' +
        @options.pandocOutputType + ' ' +
        @options.pandocOptions +
        ' -o ' + fullOutFileName +
        ' ' + tempInputFile
    @_exec command, cwd: fullOutDirName
    @_fs.unlink tempInputFile


  ###*
  # Converts HTML file at given path to MD formatted text.
  # @param {string} fullInPath Absolute path to file to convert
  ###
  prepareContent: (fullInPath) ->
    fileText = @_fs.readFileSync fullInPath, 'utf8'
    $ = @_cheerio.load fileText
    $content =
      if @_path.basename(fullInPath) == 'index.html'
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


#  fixLinks: (content) ->
#    $ = @_cheerio.load content
#    text = $('a').each (i, el) =>
#      oldLink = $(this).attr 'href'
#      if oldLink in HTML_FILE_LIST
#        newLink = @_path.basename(oldLink, '.html') + '.md'
#        $(this).attr 'href', newLink
#    .end()
#    .html()
#
#    text


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
      @_mkdirp fileName.substr(0, fileName.lastIndexOf('/'))
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
